'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import React from 'react';
import { useCart } from './cart-context';
import { CloseCart } from './close-cart';
import { DeleteItemButton } from './delete-item-button';
import { EditItemQuantityButton } from './edit-item-quantity-button';
import OpenCart from './open-cart';
import Price from '@/components/price';
import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function CartModal() {
  const { cart, isOpen, dispatch } = useCart();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => dispatch({ type: 'CLOSE_CART' })}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="pointer-events-none fixed inset-y-0 right-0 flex"
              style={{ marginRight: '-15px' }}
            >
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-[450px]">
                  <div className="flex h-full flex-col overflow-y-scroll bg-gray-800 shadow-xl">
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                      <div className="flex items-start justify-between relative">
                        <Dialog.Title className="text-lg font-medium text-white">
                          Shopping cart
                        </Dialog.Title>
                        <div className="absolute right-[-15px] -top-1">
                          <CloseCart />
                        </div>
                      </div>

                      {!cart || cart.lines.length === 0 ? (
                        <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                          <ShoppingCartIcon className="h-16 text-white" />
                          <p className="mt-6 text-center text-2xl font-bold text-white">
                            Your cart is empty.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-8">
                          <ul role="list" className="-my-6 divide-y divide-gray-600">
                            {cart.lines.map(line => (
                              <li key={line.id} className="flex py-6">
                                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-600">
                                  <Image
                                    src={line.merchandise.product.featuredImage.url}
                                    alt={line.merchandise.product.title}
                                    width={80}
                                    height={80}
                                  />
                                </div>

                                <div className="ml-4 flex flex-1 flex-col justify-between">
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1 mr-8">
                                        <h3 className="text-base font-medium text-white leading-normal">
                                          <Link
                                            href={`/product/${line.merchandise.product.handle}`}
                                            className="text-white hover:text-gray-300"
                                          >
                                            {line.merchandise.product.title}
                                          </Link>
                                        </h3>
                                        <p className="text-sm text-gray-300">
                                          {line.merchandise.title}
                                        </p>
                                      </div>
                                      <div className="text-right flex-shrink-0 min-w-[100px]">
                                        <span className="text-white font-medium">
                                          ${line.cost.totalAmount.amount}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between mt-1.5">
                                    <div className="flex items-center bg-gray-700 rounded-full px-4 py-2">
                                      <EditItemQuantityButton item={line} type="minus" />
                                      <span className="mx-4 text-white font-medium text-sm">
                                        {line.quantity}
                                      </span>
                                      <EditItemQuantityButton item={line} type="plus" />
                                    </div>
                                    <DeleteItemButton item={line} />
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {cart && cart.lines.length > 0 && (
                      <div className="border-t border-gray-600 px-6 py-6">
                        <div className="flex justify-between text-base font-medium text-white">
                          <p>Subtotal</p>
                          <Price
                            amount={cart.cost.totalAmount.amount}
                            currencyCode={cart.cost.totalAmount.currencyCode}
                          />
                        </div>
                        <p className="mt-0.5 text-sm text-gray-300">
                          Shipping and taxes calculated at checkout.
                        </p>
                        <div className="mt-6">
                          <a
                            href={cart.checkoutUrl}
                            className="flex items-center justify-center rounded-md border border-transparent bg-[#FF9500] px-6 py-3 text-base font-medium text-black shadow-sm hover:bg-[#FF9500]/90"
                          >
                            Checkout
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
