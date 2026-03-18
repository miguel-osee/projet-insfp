export default function ImageMarque({ images }) {
  return (
    <div className="w-full py-10 overflow-hidden ">
      <div className="flex gap-10 animate-marquee whitespace-nowrap">
        
        {/* DUPLICATION pour effet infini */}
        {[...images, ...images].map((img, index) => (
          <img
            key={index}
            src={img}
            alt=""
            className="object-cover w-auto h-48 rounded-xl"
          />
        ))}

      </div>
    </div>
  );
}
