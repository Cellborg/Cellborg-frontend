import React from 'react';
import dynamic from 'next/dynamic';
const HomeLayout = dynamic(() => import('../components/HomeLayout'), {ssr: false});

function News() {
  // Define an array of news articles
  const newsArticles = [
    {
      title:'Cellborg BETA is released!',
      date:'January 24, 2024',
      summary:
        'Cellborg BETA is up and running. We are currently looking for beta-testers. If you are interested, fill out the form for a professional account on the home screen.'
    },
    {
      title: 'Cellborg Limited Co. is official!',
      date: 'October 19, 2023',
      summary:
        'Stay tuned as we embark on our journey!',
    }
    // Add more news articles as needed
  ];

  return (
    <HomeLayout>
      <div className="h-screen w-screen bg-gray-100 pt-20">
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900">News</h1>
            <div className="mt-6 space-y-12">
              {newsArticles.map((article, index) => (
                <div className="bg-white rounded-lg shadow-xl overflow-hidden" key={index}>
                  {/* <img
                    className="w-full h-48 object-cover object-center"
                    src={article.imageSrc}
                    alt={article.title}
                  /> */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900">{article.title}</h3>
                    <p className="mt-2 text-gray-600">{article.date}</p>
                    <p className="mt-2 text-gray-800">{article.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

export default News;
