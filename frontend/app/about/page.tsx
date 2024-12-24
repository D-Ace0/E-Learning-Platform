'use client';

import React from 'react';
import { FaGraduationCap, FaChalkboardTeacher, FaUsers, FaCertificate } from 'react-icons/fa';

const AboutPage = () => {
  const stats = [
    { id: 1, name: 'Active Students', value: '10,000+', icon: FaUsers },
    { id: 2, name: 'Expert Instructors', value: '100+', icon: FaChalkboardTeacher },
    { id: 3, name: 'Available Courses', value: '500+', icon: FaGraduationCap },
    { id: 4, name: 'Success Rate', value: '95%', icon: FaCertificate },
  ];

  const features = [
    {
      title: 'Interactive Learning Experience',
      description: 'Engage with our cutting-edge platform that combines video lectures, interactive quizzes, and hands-on projects.',
    },
    {
      title: 'Expert Instructors',
      description: 'Learn from industry professionals and experienced educators who bring real-world expertise to the classroom.',
    },
    {
      title: 'Flexible Learning',
      description: 'Study at your own pace with 24/7 access to course materials and a supportive learning community.',
    },
    {
      title: 'Career Support',
      description: 'Get guidance on career paths, industry insights, and job placement assistance to achieve your professional goals.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20">
        <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
                <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Transform Your Future with E-Learning
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  We're dedicated to making quality education accessible to everyone. Our platform combines cutting-edge technology 
                  with expert instruction to deliver an unmatched learning experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Trusted by learners worldwide
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Join our growing community of successful learners
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.id} className="flex flex-col bg-gray-400/5 p-8">
                    <dt className="text-sm font-semibold leading-6 text-gray-600">
                      <Icon className="mx-auto h-6 w-6 text-indigo-600 mb-2" />
                      {stat.name}
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">
                      {stat.value}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Why Choose Us</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to succeed
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our platform is designed to provide you with the best possible learning experience, 
              combining technology with expert instruction.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    {feature.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Our Mission</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Empowering Through Education
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We believe that quality education should be accessible to everyone. Our mission is to break down barriers 
              to education and provide opportunities for lifelong learning. Through our platform, we aim to empower 
              individuals to achieve their personal and professional goals.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to Start Learning?
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Join our community of learners and start your journey towards success today.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/signup"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get Started
              </a>
              <a href="/courses" className="text-sm font-semibold leading-6 text-gray-900">
                View Courses <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 