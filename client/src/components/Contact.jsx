import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Contact({listing}) {
    const {currentUser} = useSelector((state) => state.user);
    const currentUserEmail = currentUser.email;
    const [landlord, setLandlord] = useState(null);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false); // new state variable
    const onChange = (e) => {
        setMessage(e.target.value);
    }
    const sendEmail = async () => {
        setIsSending(true); // set isSending to true when the email is being sent
        try {
            const res = await fetch('/api/contact/sendEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: currentUserEmail,
                    to: landlord.email,
                    subject: `${listing.name}`, //Sending the listing name in the subject variable for contact.controller.jsx
                    text: message
                })
            });
            if (!res.ok) {
                throw new Error('Failed to send email');
            }
            toast.success('Email sent successfully');
            setMessage('');
            const data = await res.json();
            setIsSending(false); // set isSending back to false when the email has been sent
        } catch (error) {
            console.log(error);
            toast.error('Failed to send email');
        }
    }

    useEffect(()=>{
        const fetchLandlord = async () => {
            try {
                const res = await fetch(`/api/user/${listing.userRef}`);
                const data = await res.json();
                setLandlord(data);
            } catch (error) {
                console.log(error);
            }
        }
        fetchLandlord();
    }, [listing.userRef])
  return (
    <>
    <ToastContainer />
        {landlord && (
            <div className='flex flex-col gap-2'>
                <p>Contact <span className='font-semibold'>{landlord.username}</span> for <span className='font-semibold'>{listing.name.toLowerCase()}</span></p>
                <textarea name="message" id="message" rows="2" value={message} onChange={onChange} placeholder='Enter your message here...' className='w-full border p-3 rounded-lg '></textarea>
                <button onClick={sendEmail} disabled={isSending} className='bg-slate-700 text-white text-center p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
                    {isSending ? 'Sending...' : 'Send Message'}
                </button>
            </div>
        )}
    </>
  )
}
