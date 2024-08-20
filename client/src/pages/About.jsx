import React from 'react';
import shoaib from './assets/shoaib.jpg';
import ammad from './assets/ammad.jpeg';
import eraj from './assets/eraj.jpg';
import najam from './assets/najam.jpg';

export default function About() {
  return (
    <div className='py-20 px-4 max-w-6xl mx-auto'>
      <h1 className='text-3xl font-bold mb-4 text-slate-800'>About Co-Work Hub</h1>
      <p className='mb-6 text-slate-700'>
        Welcome to Co-Work Hub, your comprehensive solution for revolutionizing workspaces and event hosting. We pride ourselves on being a one-stop platform that seamlessly connects seekers with providers, offering a curated selection of spaces, hassle-free bookings, and unforgettable experiences.
      </p>
      <p className='mb-6 text-slate-700'>
        At Co-Work Hub, we understand the importance of versatility in today’s dynamic world. Whether you're looking for a conducive workspace for your daily routines or planning a special event like a wedding or seminar, our platform has got you covered. Our user-friendly interface empowers providers to showcase their spaces with vibrant imagery and detailed descriptions, making it easy for you to find the perfect fit for your requirements.
      </p>
      <p className='mb-6 text-slate-700'>
        Gone are the days of tedious booking processes and uncertainty. With our integrated booking and payment systems, you can secure your desired space with confidence and convenience. We prioritize transparency and security, ensuring a seamless experience for both providers and seekers.
      </p>
      <p className='mb-6 text-slate-700'>
        But our commitment to enhancing your experience doesn’t stop there. We have partnered with top-notch catering services to elevate your event hosting experience, adding an extra layer of convenience and luxury to your gatherings.
      </p>
      <p className='mb-6 text-slate-700'>
        Join us at Co-Work Hub and step into the future of flexible workspaces and event hosting. Empower your work life and create unforgettable moments with us. Welcome to a world of possibilities with Co-Work Hub.
      </p>
      <h2 className='text-2xl font-bold mb-3 text-slate-800'>Our Mission</h2>
      <p className='mb-6 text-slate-700'>
        Our mission is to transform the future of workspace finding and event hosting through an innovative online platform. We connect providers with customers for a seamless experience, focusing on productivity, creativity, and collaboration.
      </p>
      <h2 className='text-2xl font-bold mb-4 text-slate-800'>Meet Our Team</h2>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <TeamMemberCard
          imageSrc={shoaib}
          name='Shoaib Jawed'
          designation='2020F-BCE-064'
        />
        <TeamMemberCard
          imageSrc={ammad}
          name='Muhammad Ammad'
          designation='2020F-BCE-051'
        />
        <TeamMemberCard
          imageSrc={eraj}
          name='Eraj Hassan Khan'
          designation='2020F-BCE-086'
        />
        <TeamMemberCard
          imageSrc={najam}
          name='Najam-Ul-Haque'
          designation='2020F-BCE-154'
        />
      </div>
      <h2 className='text-2xl font-bold mb-4 text-slate-800 mt-12'>Our Videos</h2>
      <div className='flex justify-center'>
        <iframe
          width='560'
          height='315'
          src='https://youtube.com/embed/FHW_DezO6z8'
          title='Co-Work Hub Video'
          className='rounded-md'
          allowFullScreen/>
      </div>
    </div>
  );
}

function TeamMemberCard({ imageSrc, name, designation }) {
  return (
    <div className='bg-white shadow-md rounded-md p-6'>
      <img
        src={imageSrc}
        alt={name}
        className='rounded-full w-24 h-24 mx-auto mb-4'
      />
      <h3 className='text-xl font-bold mb-2'>{name}</h3>
      <p className='text-gray-600'>{designation}</p>
    </div>
  );
}