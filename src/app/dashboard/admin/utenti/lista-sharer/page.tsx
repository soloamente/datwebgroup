"use client";

import SharerList from "../sharer-list"; // Adjust the import path

export default function ListaSharerPage() {
  return (
    <main>
      <div className="flex items-center justify-between py-2 md:py-4">
        <h1 className="text-2xl font-medium md:text-4xl dark:text-white">
          Lista Sharer
        </h1>
      </div>
      <SharerList />
    </main>
  );
}
