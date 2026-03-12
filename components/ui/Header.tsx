'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Phone, MapPin } from 'lucide-react';

export function Header() {
  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container flex h-28 md:h-32 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="relative h-24 w-80 md:h-28 md:w-[28rem]">
            <Image
              src="/clinic-logo.png"
              alt="Dr. Sindhu's Skin Clinic"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Contact Info - Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Velachery, Chennai</span>
          </div>
          <a
            href="tel:+919876543210"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span className="font-medium">Book: +91 98765 43210</span>
          </a>
        </div>

        {/* Contact Info - Mobile */}
        <a
          href="tel:+919876543210"
          className="md:hidden flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-full text-sm"
        >
          <Phone className="h-4 w-4" />
          <span>Call</span>
        </a>
      </div>
    </motion.header>
  );
}
