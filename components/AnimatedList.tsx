"use client";

import React, { useRef, useState, useEffect, ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import "./AnimatedList.css";
import { Ripples } from "ldrs/react";
import "ldrs/react/Ripples.css";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/Button";
import { Clock, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface Gig {
  _id: string;
  companyName: string;
  companyLogo?: string;
  description: string;
  payment: string;
  skills: string[];
  datePosted: string;
  category?: string;
}

interface AnimatedItemProps {
  children: ReactNode;
  delay?: number;
  index: number;
  onMouseEnter: () => void;
  onClick: () => void;
}

const AnimatedItem: React.FC<AnimatedItemProps> = ({
  children,
  delay = 0,
  index,
  onMouseEnter,
  onClick,
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5, once: false });

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      style={{ marginBottom: "1rem", cursor: "pointer" }}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedListProps {
  onItemSelect: (item: Gig, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  displayScrollbar?: boolean;
  className?: string;
  itemClassName?: string;
  initialSelectedIndex?: number;
  items?: Gig[]; // Added items prop for backward compatibility
}

const AnimatedList: React.FC<AnimatedListProps> = ({
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  displayScrollbar = true,
  className = "",
  itemClassName = "",
  initialSelectedIndex = -1,
  items: externalItems, // For backward compatibility
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] =
    useState<number>(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState<boolean>(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState<number>(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState<number>(1);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch gigs function
  const fetchGigs = async () => {
    try {
      const res = await fetch("/api/gigs");
      const data = await res.json();
      setGigs(data.gigs || []);
    } catch (err) {
      console.error("Failed to fetch gigs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Use external items if provided, otherwise fetch gigs
  useEffect(() => {
    if (externalItems) {
      setGigs(externalItems);
      setLoading(false);
    } else {
      fetchGigs();
    }
  }, [externalItems]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1)
    );
  };

  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, gigs.length - 1));
      } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        if (selectedIndex >= 0 && selectedIndex < gigs.length) {
          e.preventDefault();
          if (onItemSelect) {
            onItemSelect(gigs[selectedIndex], selectedIndex);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gigs, selectedIndex, onItemSelect, enableArrowNavigation]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    if (!container) return;

    const selectedItem = container.querySelector<HTMLElement>(
      `[data-index="${selectedIndex}"]`
    );

    if (!selectedItem) return;
    if (selectedItem) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: "smooth" });
      } else if (
        itemBottom >
        containerScrollTop + containerHeight - extraMargin
      ) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: "smooth",
        });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Ripples size={45} speed={2} color="#22c55e" />
      </div>
    );
  }

  const router = useRouter();

  // Function to truncate description
  const truncateDescription = (text: string, maxLength = 100) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) : text;
  };

  return (
    <div className={`scroll-list-container h-[400px] ${className}`}>
      <div
        ref={listRef}
        className={`scroll-list ${
          !displayScrollbar ? "no-scrollbar" : ""
        } p-4 space-y-4`}
        onScroll={handleScroll}
      >
        {gigs.map((job, index) => (
          <AnimatedItem
            key={job._id}
            delay={0.05 * index}
            index={index}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => {
              setSelectedIndex(index);
              if (onItemSelect) {
                onItemSelect(job, index);
              }
            }}
          >
            <Card
              className="bg-white max-w-[300px] lg:max-w-[400px] w-full mx-auto rounded-2xl shadow-sm h-[200px] cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/zigs/${job._id}`)}
            >
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-12 h-12 border-2 border-gray-200">
                    <AvatarImage src={job.companyLogo} alt={job.companyName} />
                    <AvatarFallback className="bg-yellow-400 text-black font-bold text-lg">
                      {job.companyName.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {job.companyName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-skill" />
                        <span>{job.openings || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(job.datePosted).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-gray-700 text-sm h-[60px] overflow-hidden">
                  <p className="leading-relaxed">
                    {truncateDescription(job.description)}
                    {job.description && job.description.length > 100 && (
                      <span className="inline-flex items-center ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        ...
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1">
                    <span className="text-skill text-lg">
                      {job.payment.startsWith("$") ? "$" : "₹"}
                    </span>
                    <span className="text-skill font-semibold text-lg">
                      {job.payment.replace(/[^0-9]/g, "")}
                    </span>
                  </div>
                  <Button
                    className={`px-6 py-2 rounded-full bg-skill hover:bg-skillText hover:text-skill text-skillText`}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push("/login");
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedItem>
        ))}
      </div>

      {showGradients && (
        <>
          <div
            className="top-gradient"
            style={{ opacity: topGradientOpacity }}
          ></div>
          <div
            className="bottom-gradient"
            style={{ opacity: bottomGradientOpacity }}
          ></div>
        </>
      )}
    </div>
  );
};

export default AnimatedList;
