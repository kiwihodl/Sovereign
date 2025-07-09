'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useCart } from './cart-context';
import { CloseCart } from './close-cart';
import { DeleteItemButton } from './delete-item-button';
import { EditItemQuantityButton } from './edit-item-quantity-button';
import OpenCart from './open-cart';
import Price from '@/components/price';
import Link from 'next/link';

type MerchandiseSearchParams = {
  [key: string]: string;
};

export default function CartModal({ cart }: { cart: any }) {
  const { isOpen, dispatch } = useCart();

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
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl dark:bg-black">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          Shopping cart
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <CloseCart />
                        </div>
                      </div>

                      {!cart || cart.lines.length === 0 ? (
                        <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                          <OpenCart />
                          <p className="mt-6 text-center text-2xl font-bold">Your cart is empty.</p>
                        </div>
                      ) : (
                        <div className="mt-8">
                          <ul
                            role="list"
                            className="-my-6 divide-y divide-gray-200 dark:divide-gray-700"
                          >
                            {cart.lines.map(line => (
                              <li key={line.id} className="flex py-6">
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                                  <img
                                    src={line.merchandise.product.featuredImage.url}
                                    alt={line.merchandise.product.title}
                                    className="h-full w-full object-cover object-center"
                                  />
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900 dark:text-gray-100">
                                      <h3>
                                        <Link href={`/product/${line.merchandise.product.handle}`}>
                                          {line.merchandise.product.title}
                                        </Link>
                                      </h3>
                                      <Price
                                        className="text-right"
                                        amount={line.cost.totalAmount.amount}
                                        currencyCode={line.cost.totalAmount.currencyCode}
                                      />
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                      {line.merchandise.title}
                                    </p>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-sm">
                                    <div className="flex items-center">
                                      <p className="text-gray-500 dark:text-gray-400">
                                        Qty {line.quantity}
                                      </p>
                                      <div className="ml-4 flex">
                                        <EditItemQuantityButton item={line} type="minus" />
                                        <EditItemQuantityButton item={line} type="plus" />
                                      </div>
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

                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6 dark:border-gray-700">
                      <div className="flex justify-between text-base font-medium text-gray-900 dark:text-gray-100">
                        <p>Subtotal</p>
                        <Price
                          amount={cart?.cost?.totalAmount.amount || '0'}
                          currencyCode={cart?.cost?.totalAmount.currencyCode || 'USD'}
                        />
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        Shipping and taxes calculated at checkout.
                      </p>
                      <div className="mt-6">
                        <a
                          href={cart?.checkoutUrl}
                          className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                        >
                          Checkout
                        </a>
                      </div>
                    </div>
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
