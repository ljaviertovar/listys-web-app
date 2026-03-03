'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

import { motion, useCycle } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'

import AuthButtons from '../features/auth/auth-buttons'
import Logo from '../commons/logo'

import { NavItem } from '@/types'
import { MARKETING_SECTION_LINKS, NAV_ITEMS } from '@/data/constants'

type MenuItemWithSubMenuProps = {
	item: NavItem
	toggleOpen: () => void
}

function scrollToSection(href: string) {
	if (typeof window === 'undefined') return

	const hash = href.split('#')[1]
	if (!hash || window.location.pathname !== '/') return

	const target = document.getElementById(hash)
	if (!target) return

	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
	const headerOffset = 76
	const top = target.getBoundingClientRect().top + window.scrollY - headerOffset

	window.history.replaceState(null, '', `/#${hash}`)
	window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
}

const sidebar = {
	open: (height = 1000) => ({
		clipPath: `circle(${height * 2 + 200}px at 0 0)`,
		transition: {
			type: 'spring' as const,
			stiffness: 20,
			restDelta: 2,
		},
	}),
	closed: {
		clipPath: 'circle(0px at 0 0)',
		transition: {
			type: 'spring' as const,
			stiffness: 400,
			damping: 40,
		},
	},
}

export default function HeaderMobile() {
	const pathname = usePathname()
	const containerRef = useRef(null)
	const { height } = useDimensions(containerRef)
	const [isOpen, toggleOpen] = useCycle(false, true)

	return (
		<>
			<header className='sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-b bg-background/40 shadow bg-opacity-60 backdrop-blur-lg backdrop-filter px-3 transition-shadow sm:px-4 lg:hidden'>
				<div className='z-30 flex h-10 w-10 items-center justify-start'>
					<MenuToggle toggle={toggleOpen} />
				</div>
				<div className='flex items-center justify-center'>
					<Logo />
				</div>
				<div className='pointer-events-auto z-30 flex min-w-[112px] items-center justify-end'>
					<AuthButtons />
				</div>
			</header>

			<motion.nav
				initial={false}
				animate={isOpen ? 'open' : 'closed'}
				custom={height}
				className={`fixed inset-0 z-40 w-full lg:hidden ${isOpen ? '' : 'pointer-events-none'}`}
				ref={containerRef}
			>
				<motion.div
					className='absolute inset-0 right-0 w-full bg-background'
					variants={sidebar}
				/>
				<motion.ul
					variants={variants}
					className='absolute grid place-content-center h-full w-full gap-3 px-10 py-16 max-h-screen overflow-y-auto'
				>
					<div className='mb-6'>
						<div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
							{MARKETING_SECTION_LINKS.map(link => (
								<MenuItem key={link.href}>
									<Link
										href={link.href}
										onClick={event => {
											if (
												link.href.includes('#') &&
												typeof window !== 'undefined' &&
												window.location.pathname === '/'
											) {
												event.preventDefault()
												toggleOpen()
												setTimeout(() => scrollToSection(link.href), 180)
												return
											}
											toggleOpen()
										}}
										className='mb-1 block rounded-xl bg-white/70 px-3 py-3 text-lg font-semibold text-foreground  transition-all hover:border-primary/25 hover:bg-white hover:text-primary'
									>
										{link.label}
									</Link>
								</MenuItem>
							))}
						</div>
					</div>

					<div className='my-2 h-px w-full bg-border/70' />

					{NAV_ITEMS.map((item, idx) => {
						return (
							<div key={idx}>
								{item.submenu ? (
									<MenuItemWithSubMenu
										item={item}
										toggleOpen={toggleOpen}
									/>
								) : (
									<MenuItem>
										<Link
											href={item.href}
											onClick={() => toggleOpen()}
											className={`flex w-full text-2xl mb-2 text-muted-foreground ${
												item.href === pathname && 'text-primary'
											}`}
										>
											<div className='flex items-center gap-2'>
												{item.icon && (
													<HugeiconsIcon
														icon={item.icon}
														className='h-6 w-6'
														strokeWidth={2}
													/>
												)}

												{item.title}
											</div>
										</Link>
									</MenuItem>
								)}
							</div>
						)
					})}
				</motion.ul>
			</motion.nav>
		</>
	)
}

const MenuToggle = ({ toggle }: { toggle: any }) => (
	<button
		onClick={toggle}
		className='pointer-events-auto z-30 flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent/70'
		aria-label='Toggle menu'
	>
		<svg
			width='23'
			height='23'
			viewBox='0 0 23 23'
		>
			<Path
				variants={{
					closed: { d: 'M 2 2.5 L 20 2.5' },
					open: { d: 'M 3 16.5 L 17 2.5' },
				}}
			/>
			<Path
				d='M 2 9.423 L 20 9.423'
				variants={{
					closed: { opacity: 1 },
					open: { opacity: 0 },
				}}
				transition={{ duration: 0.1 }}
			/>
			<Path
				variants={{
					closed: { d: 'M 2 16.346 L 20 16.346' },
					open: { d: 'M 3 2.5 L 17 16.346' },
				}}
			/>
		</svg>
	</button>
)

const Path = (props: any) => (
	<motion.path
		fill='transparent'
		strokeWidth='2'
		stroke='currentColor'
		strokeLinecap='round'
		{...props}
	/>
)

const MenuItem = ({ className, children }: { className?: string; children?: ReactNode }) => {
	return (
		<motion.li
			variants={MenuItemVariants}
			className={className}
		>
			{children}
		</motion.li>
	)
}

const MenuItemWithSubMenu: React.FC<MenuItemWithSubMenuProps> = ({ item, toggleOpen }) => {
	const pathname = usePathname()
	const [subMenuOpen, setSubMenuOpen] = useState(false)

	return (
		<>
			<MenuItem>
				<button
					className='flex w-full text-2xl'
					onClick={() => setSubMenuOpen(!subMenuOpen)}
				>
					<div className='flex flex-row justify-between w-full items-center'>
						<span className={`${pathname.includes(item.url) ? 'font-bold' : ''}`}>{item.title}</span>
						{/* <div className={`${subMenuOpen && 'rotate-180'}`}>
              <Icon icon="lucide:chevron-down" width="24" height="24" />
            </div> */}
					</div>
				</button>
			</MenuItem>
			<div className='mt-2 ml-2 flex flex-col space-y-2'>
				{subMenuOpen && (
					<>
						{(item as any).subMenuItems?.map((subItem: any, subIdx: number) => {
							return (
								<MenuItem key={subIdx}>
									<Link
										href={subItem.href}
										onClick={() => toggleOpen()}
										className={` ${subItem.href === pathname ? 'font-bold' : ''}`}
									>
										{subItem.title}
									</Link>
								</MenuItem>
							)
						})}
					</>
				)}
			</div>
		</>
	)
}

const MenuItemVariants = {
	open: {
		y: 0,
		opacity: 1,
		transition: {
			y: { stiffness: 1000, velocity: -100 },
		},
	},
	closed: {
		y: 50,
		opacity: 0,
		transition: {
			y: { stiffness: 1000 },
			duration: 0.02,
		},
	},
}

const variants = {
	open: {
		transition: { staggerChildren: 0.02, delayChildren: 0.15 },
	},
	closed: {
		transition: { staggerChildren: 0.01, staggerDirection: -1 },
	},
}

const useDimensions = (ref: any) => {
	const dimensions = useRef({ width: 0, height: 0 })

	useEffect(() => {
		if (ref.current) {
			dimensions.current.width = ref.current.offsetWidth
			dimensions.current.height = ref.current.offsetHeight
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ref])

	return dimensions.current
}
