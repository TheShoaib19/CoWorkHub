import Order from '../models/order.model.js';
import nodemailer from 'nodemailer';
import User from '../models/user.model.js';
import Listing from '../models/listing.model.js';  // Assuming you have a Listing model
import Catering from '../models/catering.model.js';
// Helper function to check if two date-time ranges overlap
const isDateTimeRangeOverlapping = (itemStartDateTime, itemEndDateTime, existingStartDateTime, existingEndDateTime) => {
  const itemStart = new Date(itemStartDateTime);
  const itemEnd = new Date(itemEndDateTime);
  const existingStart = new Date(existingStartDateTime);
  const existingEnd = new Date(existingEndDateTime);

  if (itemStart > existingEnd || itemEnd < existingStart) {
    return false;
  }

  return true;
};
export const checkReservationOverlap = async (req, res) => {
  try {
    const { items } = req.body;
    // Validate input
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid or missing items data' });
    }

    // Check for overlapping reservations
    for (const item of items) {
      if (item.listing) {

        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);

        const existingOrders = await Order.find({
          items: {
            $elemMatch: {
              listing: item.listing,
              startDate: { $lte: endDate },
              endDate: { $gte: startDate },
            },
          },
        });

        for (const existingOrder of existingOrders) {
          for (const existingItem of existingOrder.items) {
            if (existingItem.listing && existingItem.listing.toString() === item.listing.toString()) {
              const itemStartDateTime = new Date(`${item.startDate}T${item.startTime || '00:00:00'}`);
              const itemEndDateTime = new Date(`${item.endDate}T${item.endTime || '23:59:59'}`);

              const existingStartDateTime = new Date(`${existingItem.startDate.toISOString().split('T')[0]}T${existingItem.startTime || '00:00:00'}`);
              const existingEndDateTime = new Date(`${existingItem.endDate.toISOString().split('T')[0]}T${existingItem.endTime || '23:59:59'}`);

              if (isDateTimeRangeOverlapping(
                itemStartDateTime,
                itemEndDateTime,
                existingStartDateTime,
                existingEndDateTime
              )) {
                // console.log(`Overlap found for listing ID: ${item.listing}`);
                return res.status(400).json({ message: `Work space Already Book with in date you can select after dateTime :${existingEndDateTime}` });
              }
            }
          }
        }
      }
    }
    return res.status(200).json({ message: 'No overlapping reservations found' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId)
      .populate('items.listing')
      .populate('items.catering');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    // console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { items, totalPrice, expiryDate, cvv, cardNumber, paymentMethod, address,deliveryDateTime } = req.body;

    // Validate input
    if (!items || !totalPrice || !address) {
      return res.status(400).json({ message: 'Incomplete order data' });
    }

    // if (typeof totalPrice !== 'number') {
    //   return res.status(400).json({ message: 'Total price must be a number' });
    // }

    // // Check for overlapping reservations
    // for (let item of items) {
    //   if (item.listing) { // Only check for listings, not catering
    //     const existingOrders = await Order.find({
    //       'items.listing': item.listing,
    //       $or: [
    //         {
    //           'items.startDate': { $lte: item.endDate },
    //           'items.endDate': { $gte: item.startDate }
    //         }
    //       ]
    //     });

    //     for (let existingOrder of existingOrders) {
    //       for (let existingItem of existingOrder.items) {
    //         if (existingItem.listing && existingItem.listing.toString() === item.listing.toString()) {
    //           const itemStartDateTime = new Date(item.startDate + 'T' + item.startTime);
    //           const itemEndDateTime = new Date(item.endDate + 'T' + item.endTime);

    //           const existingStartDateTime = new Date(existingItem.startDate + 'T' + existingItem.startTime);
    //           const existingEndDateTime = new Date(existingItem.endDate + 'T' + existingItem.endTime);

    //           if (isDateTimeRangeOverlapping(
    //             itemStartDateTime,
    //             itemEndDateTime,
    //             existingStartDateTime,
    //             existingEndDateTime
    //           )) {
    //             return res.status(400).json({ message: 'The selected listing is already booked for the chosen date and time.' });
    //           }
    //         }
    //       }
    //     }
    //   }
    // }

    // Create new order with the user ID
    const newOrder = new Order({
      user: userId,
      items,
      totalPrice: parseFloat(totalPrice), // Ensure totalPrice is a number
      expiryDate,
      cvv,
      cardNumber,
      paymentMethod,
      address,
    });

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await newOrder.save();

    // Get detailed listing information
    const detailedItems = await Promise.all(items.map(async (item) => {
      if (item.listing) {
        const listing = await getListingById(item.listing);
        return {
          ...item,
          listingDetails: listing
        };
      }
      else if (item.catering) {
        const catering = await getCateringById(item.catering._id);
        return {
          ...item,
          cateringDetails: catering
        };
      }
      return item; // If no listing or catering, return item as is
    }));

     await sendOrderConfirmationEmail(user.email, user.username, totalPrice, detailedItems);

    return res.status(201).json({ message: 'Order placed successfully' });
  } catch (error) {
    console.error('Error creating order:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const sendOrderConfirmationEmail = async (email, username, totalPrice, items) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let itemsHtml = '<ul>';
    
    for (let item of items) {
      if (item.listingDetails) {
        // Listing item details
        itemsHtml += `
          <li>
            <strong>Listing</strong>: ${item.listingDetails.name}<br/>
            Description: ${item.listingDetails.description}<br/>
            Location: ${item.listingDetails.address} ${item.listingDetails.area}<br/>
            Start: ${item.startDate} ${item.startTime}<br/>
            End: ${item.endDate} ${item.endTime}
          </li>`;
      } else if (item.cateringDetails) {
        // Catering item details
        itemsHtml += `
          <li>
            <strong>Catering</strong>: ${item.cateringDetails.name}<br/>
            Description: ${item.cateringDetails.description}<br/>
            Address: ${item.cateringDetails.address}<br/>
            Area: ${item.cateringDetails.area}<br/>
            Menu: ${item.cateringDetails.menu}<br/>
            Capacity: ${item.cateringDetails.capacity}<br/>
            Selected Items:<br/>
            <ul>
              ${item.selectedItems.map(selectedItem => `
                <li>
                  Name: ${selectedItem.name}<br/>
                  Price: ${selectedItem.price}<br/>
                  Unit: ${selectedItem.unit}<br/>
                  Quantity: ${selectedItem.quantity || item.quantity}<br/>
                </li>
              `).join('')}
            </ul>
            Delivery DateTime: ${item.deliveryDateTime}<br/>
            
          </li>`;
      }
    }
    
    itemsHtml += '</ul>';

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Order Confirmation',
      html: `
        <h1>Order Confirmation</h1>
        <p>Dear ${username},</p>
        <p>Thank you for your order. We are pleased to confirm that your order has been successfully placed.</p>
        <p><strong>Order Details:</strong></p>
        ${itemsHtml}
        <p>Total Price: <strong>${totalPrice}</strong></p>
        <p>We appreciate your business and look forward to serving you again.</p>
        <p>Best regards,<br/>Co-WorkHub Support Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent" };
  } catch (error) {
    console.error('Error sending email:', error.message);
    return { success: false, message: "Failed to send email" };
  }
};

// Function to get user details by ID
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    throw new Error('Failed to fetch user details');
  }
};

// Function to get listing details by ID
const getListingById = async (listingId) => {
  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      throw new Error('Catering item not found');
    }
    return listing;
  } catch (error) {
    console.error('Error fetching listing details:', error.message);
    throw new Error('Failed to fetch listing details');
  }
};
const getCateringById = async (cateringId) => {
  try {
    // Fetch the catering item from the database
    const catering = await Catering.findById(cateringId);

    // Check if the catering item exists
    if (!catering) {
      throw new Error('Catering item not found');
    }

    return catering;
  } catch (error) {
    console.error('Error fetching catering details:', error.message);
    throw new Error('Failed to fetch catering details');
  }
};