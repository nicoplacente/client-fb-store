"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay } from "swiper/modules";

export default function SpreenCarrousel() {
  const items = [
    {
      title: "Play 5",
      price: 3000,
      stock: 98,
      img: "https://imgs.search.brave.com/yrmsrg5vljT3O1cUj95GuqF6L6ek_7Vq2P0PDMkoKWw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTI4/NzE3Mzc1Mi9lcy9m/b3RvL251ZXZhLXBs/YXlzdGF0aW9uLTUu/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PWJaeU9JMUpvb09W/YVFBWUZ6SEhIVXFL/cUlSNGFrdHZNNnFx/bWJtMEZ1cFk9",
    },
    {
      title: "Minecraft Premium",
      price: 2998,
      stock: 100,
      img: "https://imgs.search.brave.com/6sX6IJHXPTRBdaoV7Yoy2bpWDbgNnKdjsEts3UvUvk4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hLmFs/bGVncm9pbWcuY29t/L3MxODAvMWU5YjAw/LzE5NWY0OTA3NDlm/MmI2N2VlYjNjNWVi/YWM2NjkvTWluZWNy/YWZ0LVByZW1pdW0t/RWRpdGlvbi1KYXZh/LVBD",
    },
    {
      title: "Random SteamCode",
      price: 2750,
      stock: 3,
      img: "https://imgs.search.brave.com/BkmLFIRmor670uAna5mu-_Nq0KI-NFAHeH3vS4pzCHw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9kaWdp/dGFsLmRhdGFibGl0/ei5jb20ucGgvY2Ru/L3Nob3AvcHJvZHVj/dHMvMTAwMF8yM2U1/YzU0MC04ZDdjLTQ4/MDUtYTg4ZS0xMDBh/ZTIzZGMzMjgucG5n/P3Y9MTU5MTA5MTY1/MSZ3aWR0aD01MzM",
    },
    {
      title: "Play 5",
      price: 3000,
      stock: 98,
      img: "https://imgs.search.brave.com/yrmsrg5vljT3O1cUj95GuqF6L6ek_7Vq2P0PDMkoKWw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTI4/NzE3Mzc1Mi9lcy9m/b3RvL251ZXZhLXBs/YXlzdGF0aW9uLTUu/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PWJaeU9JMUpvb09W/YVFBWUZ6SEhIVXFL/cUlSNGFrdHZNNnFx/bWJtMEZ1cFk9",
    },
    {
      title: "Minecraft Premium",
      price: 2998,
      stock: 100,
      img: "https://imgs.search.brave.com/6sX6IJHXPTRBdaoV7Yoy2bpWDbgNnKdjsEts3UvUvk4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hLmFs/bGVncm9pbWcuY29t/L3MxODAvMWU5YjAw/LzE5NWY0OTA3NDlm/MmI2N2VlYjNjNWVi/YWM2NjkvTWluZWNy/YWZ0LVByZW1pdW0t/RWRpdGlvbi1KYXZh/LVBD",
    },
    {
      title: "Random SteamCode",
      price: 2750,
      stock: 3,
      img: "https://imgs.search.brave.com/BkmLFIRmor670uAna5mu-_Nq0KI-NFAHeH3vS4pzCHw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9kaWdp/dGFsLmRhdGFibGl0/ei5jb20ucGgvY2Ru/L3Nob3AvcHJvZHVj/dHMvMTAwMF8yM2U1/YzU0MC04ZDdjLTQ4/MDUtYTg4ZS0xMDBh/ZTIzZGMzMjgucG5n/P3Y9MTU5MTA5MTY1/MSZ3aWR0aD01MzM",
    },
    {
      title: "Play 5",
      price: 3000,
      stock: 98,
      img: "https://imgs.search.brave.com/yrmsrg5vljT3O1cUj95GuqF6L6ek_7Vq2P0PDMkoKWw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTI4/NzE3Mzc1Mi9lcy9m/b3RvL251ZXZhLXBs/YXlzdGF0aW9uLTUu/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PWJaeU9JMUpvb09W/YVFBWUZ6SEhIVXFL/cUlSNGFrdHZNNnFx/bWJtMEZ1cFk9",
    },
    {
      title: "Minecraft Premium",
      price: 2998,
      stock: 100,
      img: "https://imgs.search.brave.com/6sX6IJHXPTRBdaoV7Yoy2bpWDbgNnKdjsEts3UvUvk4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hLmFs/bGVncm9pbWcuY29t/L3MxODAvMWU5YjAw/LzE5NWY0OTA3NDlm/MmI2N2VlYjNjNWVi/YWM2NjkvTWluZWNy/YWZ0LVByZW1pdW0t/RWRpdGlvbi1KYXZh/LVBD",
    },
    {
      title: "Random SteamCode",
      price: 2750,
      stock: 3,
      img: "https://imgs.search.brave.com/BkmLFIRmor670uAna5mu-_Nq0KI-NFAHeH3vS4pzCHw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9kaWdp/dGFsLmRhdGFibGl0/ei5jb20ucGgvY2Ru/L3Nob3AvcHJvZHVj/dHMvMTAwMF8yM2U1/YzU0MC04ZDdjLTQ4/MDUtYTg4ZS0xMDBh/ZTIzZGMzMjgucG5n/P3Y9MTU5MTA5MTY1/MSZ3aWR0aD01MzM",
    },
    {
      title: "Play 5",
      price: 3000,
      stock: 98,
      img: "https://imgs.search.brave.com/yrmsrg5vljT3O1cUj95GuqF6L6ek_7Vq2P0PDMkoKWw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTI4/NzE3Mzc1Mi9lcy9m/b3RvL251ZXZhLXBs/YXlzdGF0aW9uLTUu/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PWJaeU9JMUpvb09W/YVFBWUZ6SEhIVXFL/cUlSNGFrdHZNNnFx/bWJtMEZ1cFk9",
    },
    {
      title: "Minecraft Premium",
      price: 2998,
      stock: 100,
      img: "https://imgs.search.brave.com/6sX6IJHXPTRBdaoV7Yoy2bpWDbgNnKdjsEts3UvUvk4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hLmFs/bGVncm9pbWcuY29t/L3MxODAvMWU5YjAw/LzE5NWY0OTA3NDlm/MmI2N2VlYjNjNWVi/YWM2NjkvTWluZWNy/YWZ0LVByZW1pdW0t/RWRpdGlvbi1KYXZh/LVBD",
    },
    {
      title: "Random SteamCode",
      price: 2750,
      stock: 3,
      img: "https://imgs.search.brave.com/BkmLFIRmor670uAna5mu-_Nq0KI-NFAHeH3vS4pzCHw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9kaWdp/dGFsLmRhdGFibGl0/ei5jb20ucGgvY2Ru/L3Nob3AvcHJvZHVj/dHMvMTAwMF8yM2U1/YzU0MC04ZDdjLTQ4/MDUtYTg4ZS0xMDBh/ZTIzZGMzMjgucG5n/P3Y9MTU5MTA5MTY1/MSZ3aWR0aD01MzM",
    },
  ];

  return (
    <Swiper
      className="w-full"
      modules={[EffectCoverflow, Autoplay]}
      effect="coverflow"
      grabCursor={true}
      centeredSlides={true}
      slidesPerView="auto"
      loop={true} // Loop infinito real
      speed={1000} // Velocidad de transición
      autoplay={{
        delay: 5000, // Tiempo entre slides
        disableOnInteraction: false,
        pauseOnMouseEnter: true, // Pausa al pasar mouse
      }}
      coverflowEffect={{
        rotate: 0, // Rotación leve si querés
        stretch: 0, // Sin superposición
        depth: 200, // Profundidad 3D
        modifier: 2,
        slideShadows: true,
      }}
      watchSlidesProgress={true}
    >
      {items.map((item, i) => (
        <SwiperSlide
          key={i}
          className="!flex !flex-col !gap-6 py-6 !items-center !justify-between bg-[#1119] backdrop-blur-3xl rounded-2xl !w-1/4 !h-[500px]  text-white shadow-lg"
        >
          <div className="!flex !flex-col gap-6 ">
            <img
              src={item.img}
              alt={item.title}
              width={150}
              height={150}
              className="rounded-xl mx-auto object-cover aspect-square"
            />
            <h3 className="font-semibold text-3xl text-center font-mono text-balance">
              {item.title}
            </h3>
          </div>
          <div className="!flex !flex-col gap-6 !justify-end">
            <p className="text-yellow-400 font-extrabold text-4xl text-center">
              🪙 {item.price.toLocaleString()}
            </p>
            <p className="text-neutral-700 font-normal text-center">
              {item.stock} restantes
            </p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
