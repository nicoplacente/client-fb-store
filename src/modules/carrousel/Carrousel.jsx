"use client";

import { memo } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/autoplay";
import coins from "@/assets/coins.webp";

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
];

function SpreenCarrousel() {
  return (
    <Swiper
      className="mb-36 w-full [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]"
      modules={[EffectCoverflow, Autoplay]}
      effect="coverflow"
      grabCursor
      centeredSlides
      slidesPerView="auto"
      loop
      speed={700}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      coverflowEffect={{
        rotate: -6,
        stretch: 0,
        depth: 120,
        modifier: 1.4,
        slideShadows: false,
      }}
    >
      {items.map((item, index) => (
        <SwiperSlide
          key={item.title}
          className="!flex !h-[485px] !w-[375px] !flex-col !items-center !justify-between overflow-hidden rounded-lg bg-[#17171799] py-9 text-white shadow-lg"
        >
          <div className="!flex !flex-col gap-6">
            <img
              src={item.img}
              alt={item.title}
              width={150}
              height={150}
              className="mx-auto aspect-square rounded-xl object-cover"
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
            <h3 className="text-balance text-center font-mono text-3xl font-bold">
              {item.title}
            </h3>
          </div>
          <div className="!flex !flex-col !justify-end gap-6">
            <p className="flex items-center gap-2 text-center text-4xl font-extrabold text-yellow-400">
              <Image src={coins} alt="Creditos" className="size-8" />
              {item.price.toLocaleString()}
            </p>
            <p className="text-center font-normal text-neutral-500">
              {item.stock} restantes
            </p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default memo(SpreenCarrousel);
