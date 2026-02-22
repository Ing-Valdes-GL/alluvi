'use client'

import React from 'react'
import Link from 'next/link'
import { Activity, Mail, Phone, MapPin, ShieldCheck, ArrowRight, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t-4 border-brand-primary bg-white dark:bg-gray-950 text-gray-600 dark:text-gray-400">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-5">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Activity className="w-8 h-8 text-brand-primary" />
              <span className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                Allu<span className="text-brand-primary">vi</span>
              </span>
            </Link>
            <p className="mb-6 max-w-sm text-lg leading-relaxed">
              Powered by Alluvi Health Care. Providing premium, verified pharmaceutical products with blockchain-grade security and unmatched global logistics.
            </p>
            <div className="flex items-center gap-3 text-brand-primary font-bold bg-brand-primary/10 w-fit px-4 py-2 rounded-lg">
              <ShieldCheck size={20} />
              <span>Certified Medical Supplier</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:col-span-3 md:pl-8">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider">Explore</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/products" className="group flex items-center gap-2 hover:text-brand-primary transition-colors">
                  <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-brand-primary"/>
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="group flex items-center gap-2 hover:text-brand-primary transition-colors">
                  <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-brand-primary"/>
                  My Cart
                </Link>
              </li>
              <li>
                <Link href="/chat" className="group flex items-center gap-2 hover:text-brand-primary transition-colors">
                  <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-brand-primary"/>
                  Support Chat
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section - CORRIGÉE ICI */}
          <div className="col-span-1 md:col-span-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-4">
              {/* Email */}
              <li className="flex items-center gap-4 group">
                <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-full group-hover:bg-brand-primary transition-colors">
                  <Mail className="text-brand-primary group-hover:text-white transition-colors" size={20} />
                </div>
                <a href="mailto:support@Alluvi.com" className="hover:text-brand-primary transition-colors font-medium">
                  support@Alluvi.com
                </a>
              </li>

              {/* WhatsApp */}
              <li className="flex items-center gap-4 group">
                <a href="https://wa.me/+237692118391" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-full group-hover:bg-green-500 transition-colors">
                    <Phone className="text-brand-primary group-hover:text-white transition-colors" size={20} />
                  </div>
                  <span className="font-medium hover:text-green-500 transition-colors">WhatsApp Support</span>
                </a>
              </li>

              {/* Telegram */}
              <li className="flex items-center gap-4 group">
                <a href="https://t.me/+237692118391" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-full group-hover:bg-blue-500 transition-colors">
                    <MessageCircle className="text-brand-primary group-hover:text-white transition-colors" size={20} />
                  </div>
                  <span className="font-medium hover:text-blue-500 transition-colors">Telegram Channel</span>
                </a>
              </li>

              {/* Location */}
              <li className="flex items-center gap-4 group">
                <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-full">
                  <MapPin className="text-brand-primary" size={20} />
                </div>
                <span className="font-medium">London, United Kingdom</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-medium">© {new Date().getFullYear()} Alluvi Health-Care. All rights reserved.</p>
          <div className="flex gap-8 text-sm font-medium">
            <Link href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-brand-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}