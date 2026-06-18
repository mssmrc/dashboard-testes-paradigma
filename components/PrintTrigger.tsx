"use client";

import { useEffect } from "react";

export function PrintTrigger() {
  useEffect(() => {
    function triggerPrint() {
      window.print();
    }

    const images = Array.from(document.querySelectorAll("img[data-report-image]"));
    const pending = images.filter((img) => !(img as HTMLImageElement).complete);

    if (pending.length === 0) {
      const timer = setTimeout(triggerPrint, 300);
      return () => clearTimeout(timer);
    }

    let loaded = 0;
    const onDone = () => {
      loaded += 1;
      if (loaded >= pending.length) {
        setTimeout(triggerPrint, 300);
      }
    };

    pending.forEach((img) => {
      img.addEventListener("load", onDone);
      img.addEventListener("error", onDone);
    });

    return () => {
      pending.forEach((img) => {
        img.removeEventListener("load", onDone);
        img.removeEventListener("error", onDone);
      });
    };
  }, []);

  return null;
}
