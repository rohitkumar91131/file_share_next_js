"use client";

export default function FilesList({ files }) {
  const items = files || [];

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-3">
      
      <div className="hidden md:grid md:[grid-template-columns:2fr_1fr_1fr_1fr] text-sm font-medium text-gray-500 px-4">
        <span>Name</span>
        <span>Type</span>
        <span>Size</span>
        <span>Downloaded</span>
      </div>

      {items.map((file, i) => (
        <div
          key={i}
          className="border rounded-xl p-4 flex flex-col gap-4 md:[grid-template-columns:2fr_1fr_1fr_1fr] md:grid md:items-center relative"
        >
          <div className="flex justify-between items-start md:block w-full">
            <p className="font-medium text-sm md:text-base break-all whitespace-normal w-full block">
              {file.name}
            </p>

            <span className="md:hidden text-xs font-semibold text-gray-700 bg-gray-200 px-2 py-1 rounded-md">
              {file.type}
            </span>
          </div>

          <div className="hidden md:block text-sm text-gray-700">
            <span className="bg-gray-200 px-2 py-1 rounded-md text-gray-700 text-xs font-semibold">
              {file.type}
            </span>
          </div>

          <div className="flex items-center justify-between md:block text-sm">
            <span className="md:hidden text-xs text-gray-500">Size</span>
            <span>{file.size}</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between md:block text-sm">
              <span className="md:hidden text-xs text-gray-500">
                Downloaded
              </span>
              <span>{file.progress}%</span>
            </div>

            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black"
                style={{ width: `${file.progress || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
