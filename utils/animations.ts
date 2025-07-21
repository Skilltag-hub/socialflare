import gsap from "gsap";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const animatePageIn = () => {
  const leftBanner = document.getElementById("left-banner");
  const rightBanner = document.getElementById("right-banner");

  if (leftBanner) {
    const tl = gsap.timeline();
    tl.set(leftBanner, {
      xPercent: 0,
    }).to(leftBanner, { xPercent: -100, duration: 0.8, ease: "circ.inOut" });
  }
  if (rightBanner) {
    const tl = gsap.timeline();
    tl.set(rightBanner, {
      xPercent: 0,
    }).to(rightBanner, { xPercent: 100, duration: 0.8, ease: "circ.inOut" });
  }
};

export const animatePageOut = (href: string, router: AppRouterInstance) => {
  const leftBanner = document.getElementById("left-banner");
  const rightBanner = document.getElementById("right-banner");

  if (leftBanner) {
    const tl = gsap.timeline();
    tl.set(leftBanner, {
      xPercent: -100,
    }).to(leftBanner, { xPercent: 0, duration: 0.5, ease: "circ.inOut" });
  }
  if (rightBanner) {
    const tl = gsap.timeline();
    tl.set(rightBanner, {
      xPercent: 100,
    }).to(rightBanner, {
      xPercent: 0,
      duration: 0.5,
      ease: "circ.inOut",
      onComplete: () => {
        router.push(href);
      },
    });
  }
};
