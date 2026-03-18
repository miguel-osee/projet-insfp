import React from 'react';

export default function ContactSection() {
  return (
    <section className="bg-white py-12 px-4 md:px-16">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* 📍 Carte */}
        <div className="w-full h-96 rounded-lg overflow-hidden shadow-md">
          <iframe
            src="https://www.google.com/maps/embed?pb=..." // Remplace par ton lien exact
            className="w-full h-full border-0"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>

        {/* 📝 Formulaire */}
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Prénoms</label>
            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"></textarea>
          </div>
          <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition">
            Envoyer
          </button>
        </form>
      </div>

      {/* 📞 Infos de contact */}
      <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
        <div className="bg-gray-100 p-4 rounded-md shadow-sm">
          <p className="text-sm text-gray-600">Email</p>
          <p className="font-semibold">infsp.of@gmail.com</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-md shadow-sm">
          <p className="text-sm text-gray-600">Email</p>
          <p className="font-semibold">infsp.of@gmail.com</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-md shadow-sm">
          <p className="text-sm text-gray-600">Téléphone</p>
          <p className="font-semibold">020 31 45 70</p>
        </div>
      </div>
    </section>
  );
}