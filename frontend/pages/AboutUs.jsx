import React from 'react';
import dynamic from 'next/dynamic';
const HomeLayout = dynamic(() => import('../components/HomeLayout'), {ssr: false});

function AboutUs() {
  return (
    <HomeLayout >
      <div className="bg-gray-100 sm:w-full sm:h-full md:w-screen md:min-h-screen w-screen min-h-screen flex items-center justify-center">
        <div className="container mx-auto pt-20 pb-5 px-4 sm:px-6 lg:px-8">
          <div className="w-4xl my-10 mx-auto bg-white shadow-md rounded-md p-6">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">About Us</h1>

            {/* Mission Statement */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800">Our Mission</h2>
              <p className="mt-2 text-gray-700">
              Our mission is to empower biologists and clinicians by making next-generation sequencing tools accessible to those without a computational background.
              </p>
            </section>

            {/* Our Team */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800">Our Team</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
                {/* Team Member 1 */}
                <div className="bg-white shadow-md rounded-md p-4">
                  <h3 className="text-xl sm:text-lg font-semibold text-gray-900 mt-2">Prashant Nuthalapati</h3>
                  <p className="text-gray-600">Founder and CEO</p>
                </div>

                {/* Team Member 2 */}
                <div className="bg-white shadow-md rounded-md p-4">
                  <h3 className="text-xl sm:text-lg font-semibold text-gray-900 mt-2">Pranik Pant</h3>
                  <p className="text-gray-600">Founder and CTO</p>
                </div>

                {/* Team Member 3 */}
                <div className="bg-white shadow-md rounded-md p-4">
                  <h3 className="text-xl sm:text-lg font-semibold text-gray-900 mt-2">Nishant Nuthalapati</h3>
                  <p className="text-gray-600">Co-Founder</p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800">Contact Information</h2>
              <p className="mt-2 text-gray-700">
                If you have any questions, collaborations, or inquiries, please feel free to reach out to us.
              </p>
              <p className="mt-2 text-gray-700">
                Email: cellborg.bio@gmail.com
              </p>
              <p className="mt-2 text-gray-700">
                Phone: +1 (510) 320-1413
              </p>
            </section>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

export default AboutUs;
