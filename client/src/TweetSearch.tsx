import type { TweetSchema } from '../../api/source/api/schemas'
import { Field, Label, Input, RadioGroup, Radio } from '@headlessui/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams, type URLSearchParamsInit } from 'react-router-dom'
import { SecureField } from './components/SecureField'
import { defaultSearchValues } from './formConsts'
import { useUserContext } from './lib/userContext'
import { SideBar } from './components/Sidebar'

export type TweetSearchParams = { tweetFilter: Partial<TweetSchema>; tweetSorter?: [keyof TweetSchema, 1 | -1] }

export function TweetSearch({ tweetFilter, tweetSorter }: TweetSearchParams) {
	const { userToken, setUserToken, adminSecret, setAdminSecret } = useUserContext()
	const [, setParams] = useSearchParams()

	const { getValues, register } = useForm<typeof defaultSearchValues>({
		defaultValues: { ...defaultSearchValues, ...tweetFilter },
	})
	const [formSortBy, setFormSortBy] = useState<keyof TweetSchema | 'Default'>(tweetSorter?.[0] || 'Default')
	const [formSortDirection, setFormSortDirection] = useState<1 | -1>(tweetSorter?.[1] || 1)

	const [isSettingsOpen, setIsSettingsOpen] = useState(false)

	return (
		<SideBar isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen}>
			<form
				className={`relative rounded-lg m-2 py-2`}
				onSubmit={e => {
					e.preventDefault()
					const values = getValues()
					const nextParams: URLSearchParamsInit = {}

					if (values.content) nextParams.content = values.content
					if (values.handle) nextParams.handle = values.handle
					if (formSortBy !== 'Default') {
						nextParams.sort_by = formSortBy
						nextParams.sort_direction = String(formSortDirection)
					}
					
					setParams(nextParams)
				}}
			>
				<div className="flex flex-col gap-2 m-4">
					<p className="font-bold text-cyan-dark text-lg">Search</p>
					<Field className="hidden flex justify-between items-center">
						<Label className="label h-min">Content</Label>
						<Input
							placeholder="simple text search..."
							type="text"
							{...register('content')}
							className="m-1 px-3 py-1.5 input"
						/>
					</Field>
					<Field className="flex justify-between items-center">
						<Label className="label h-min">Artist Handle</Label>
						<Input
							placeholder="@artist"
							type="text"
							{...register('handle')}
							className={`m-1 px-3 py-1.5 input transition-colors duration-100 ease-out`}
						/>
					</Field>
					<p className="font-bold text-cyan-dark text-lg mt-6">Sort</p>
					<div className="flex justify-around mr-6 w-full text-center">
						<RadioGroup
							value={formSortBy}
							onChange={setFormSortBy}
							className="m-1 px-3 py-1.5 flex flex-col"
						>
							<Field className="m-1">
								<Radio value={'date_time' satisfies keyof TweetSchema} className="radio-option">
									Date Posted
								</Radio>
							</Field>
							<Field className="mt-3 m-1">
								<Radio value={'Default'} className="radio-option">
									Default
								</Radio>
							</Field>
						</RadioGroup>
						<RadioGroup
							value={formSortDirection}
							onChange={setFormSortDirection}
							className="m-1 px-3 py-1.5 flex flex-col"
							disabled={formSortBy === 'Default'}
						>
							<Field className="m-1">
								<Radio value={1} className="radio-option">
									Ascending
								</Radio>
							</Field>
							<Field className="mt-3 m-1">
								<Radio value={-1} className="radio-option">
									Descending
								</Radio>
							</Field>
						</RadioGroup>
					</div>
				</div>
				<div className="flex justify-center w-full">
					<button className="bg-black/10 px-6! button" type="submit">
						Search
					</button>
				</div>
			</form>
			<div className="bg-cyan-dark h-0.5 w-4/5 mt-8 mx-10"></div>
			<div className="flex flex-col gap-2 m-6">
				<p className="font-bold text-cyan-dark text-lg">Account</p>
				<SecureField
					name="User Token"
					placeholder="abc-123..."
					value={userToken ?? ''}
					setValue={(value: string) => {
						window.localStorage.setItem('userToken', value)
						setUserToken(value)
					}}
				/>
				<p className="text-sm mx-4 text-black/80">
					User Tokens track viewed posts and are stored in your browser's local storage.
				</p>
				<SecureField
					name="Access Token"
					placeholder="shh..."
					value={adminSecret ?? ''}
					setValue={setAdminSecret}
				/>
				<p className="text-sm mx-4 text-black/80">
					Access tokens are for administrator actions, and are not stored between sessions.
				</p>
			</div>
		</SideBar>
	)
}
