'use client'

import { useState, type ComponentProps } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = Omit<ComponentProps<typeof Input>, 'type' | 'size' | 'adornment'>

/** The password field of the auth forms: the 44px field with a show/hide toggle laid over its end. */
export function AuthPasswordInput({ disabled, ...props }: Props) {
	const [visible, setVisible] = useState(false)

	return (
		<div
			data-testid='auth-password-input'
			className='relative'
		>
			<Input
				{...props}
				type={visible ? 'text' : 'password'}
				size='lg'
				adornment='end'
				disabled={disabled}
			/>
			<Button
				type='button'
				variant='quiet'
				size='icon-xl'
				rounded='2xl'
				disabled={disabled}
				aria-label={visible ? 'Hide password' : 'Show password'}
				aria-pressed={visible}
				onClick={() => setVisible(current => !current)}
				className='absolute top-0 right-0'
			>
				<HugeiconsIcon
					icon={visible ? ViewOffIcon : ViewIcon}
					strokeWidth={1.8}
					className='size-5'
				/>
			</Button>
		</div>
	)
}
