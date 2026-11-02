import { describe, expect, it, vi } from 'vitest'

import {
	OCR_READ_FAILED_MESSAGE,
	decideOcrOutcome,
	extractChatCompletionText,
	extractGeminiText,
	fetchWithRetry,
	isRetryableStatus,
} from '../ocr-outcome.ts'

const respond = (status: number) => new Response('{}', { status })

describe('isRetryableStatus', () => {
	it.each([408, 429, 500, 502, 503, 504])('retries %i', status => {
		expect(isRetryableStatus(status)).toBe(true)
	})

	it.each([200, 400, 401, 403, 404, 422])('does not retry %i', status => {
		expect(isRetryableStatus(status)).toBe(false)
	})
})

describe('fetchWithRetry', () => {
	const sleep = vi.fn(async () => {})

	it('returns a good answer without retrying', async () => {
		const send = vi.fn(async () => respond(200))
		const response = await fetchWithRetry(send, { sleep })
		expect(response.status).toBe(200)
		expect(send).toHaveBeenCalledTimes(1)
	})

	it('sends again after a busy answer and returns the second one', async () => {
		const send = vi.fn().mockResolvedValueOnce(respond(429)).mockResolvedValueOnce(respond(200))
		const response = await fetchWithRetry(send, { sleep })
		expect(response.status).toBe(200)
		expect(send).toHaveBeenCalledTimes(2)
	})

	it('sends again after the network drops', async () => {
		const send = vi.fn().mockRejectedValueOnce(new Error('connection reset')).mockResolvedValueOnce(respond(200))
		const response = await fetchWithRetry(send, { sleep })
		expect(response.status).toBe(200)
	})

	it('returns the last busy answer once the retries are spent', async () => {
		const send = vi.fn(async () => respond(503))
		const response = await fetchWithRetry(send, { retries: 2, sleep })
		expect(response.status).toBe(503)
		expect(send).toHaveBeenCalledTimes(3)
	})

	it('throws the last network error once the retries are spent', async () => {
		const send = vi.fn().mockRejectedValue(new Error('connection reset'))
		await expect(fetchWithRetry(send, { sleep })).rejects.toThrow('connection reset')
		expect(send).toHaveBeenCalledTimes(2)
	})

	it('does not retry an answer a retry cannot change', async () => {
		const send = vi.fn(async () => respond(401))
		const response = await fetchWithRetry(send, { sleep })
		expect(response.status).toBe(401)
		expect(send).toHaveBeenCalledTimes(1)
	})

	it('waits longer before each further retry', async () => {
		const waits: number[] = []
		const send = vi.fn(async () => respond(500))
		await fetchWithRetry(send, { retries: 2, delayMs: 100, sleep: async ms => void waits.push(ms) })
		expect(waits).toEqual([100, 200])
	})
})

describe('extractGeminiText', () => {
	const answer = (parts: unknown[], finishReason = 'STOP') => ({ candidates: [{ content: { parts }, finishReason }] })

	it('returns the text of the answer', () => {
		expect(extractGeminiText(answer([{ text: '{"items":[]}' }]))).toEqual({ text: '{"items":[]}' })
	})

	it('skips reasoning parts that come first', () => {
		const result = extractGeminiText(answer([{ text: 'thinking about the receipt', thought: true }, { text: '[{"name":"Milk"}]' }]))
		expect(result).toEqual({ text: '[{"name":"Milk"}]' })
	})

	it('says why a blocked prompt has no answer', () => {
		expect(extractGeminiText({ promptFeedback: { blockReason: 'SAFETY' } })).toEqual({
			reason: 'Gemini blocked the request (SAFETY)',
		})
	})

	it('says why an answer cut off before any text has none', () => {
		expect(extractGeminiText(answer([], 'MAX_TOKENS'))).toEqual({
			reason: 'Gemini returned no text (finish reason MAX_TOKENS)',
		})
	})

	it.each([null, undefined, {}, { candidates: [] }, 'text'])('says there is no answer for %p', data => {
		expect(extractGeminiText(data)).toEqual({ reason: 'Gemini returned no answer' })
	})
})

describe('extractChatCompletionText', () => {
	it('returns the message content', () => {
		expect(extractChatCompletionText({ choices: [{ message: { content: ' [] ' } }] })).toEqual({ text: '[]' })
	})

	it('says why a refusal has no text', () => {
		const result = extractChatCompletionText({
			choices: [{ message: { content: null, refusal: 'no' }, finish_reason: 'stop' }],
		})
		expect(result).toEqual({ reason: 'OpenAI returned no text (refused) (finish reason stop)' })
	})

	it.each([null, {}, { choices: [] }, { choices: [{ message: { content: '' }, finish_reason: 'length' }] }])(
		'returns a reason for %p',
		data => {
			expect(extractChatCompletionText(data)).toHaveProperty('reason')
		},
	)
})

describe('decideOcrOutcome', () => {
	const read = (itemCount: number) => ({ itemCount, failure: null })
	const failed = { itemCount: 0, failure: 'Gemini Error: 429' }

	it('completes a receipt with items', () => {
		expect(decideOcrOutcome([read(18)], 18)).toEqual({ status: 'completed', partial: false })
	})

	it('fails a read where the only photo failed, instead of reporting no items', () => {
		expect(decideOcrOutcome([failed], 0)).toEqual({ status: 'failed', error: OCR_READ_FAILED_MESSAGE })
	})

	it('fails a read where every photo failed', () => {
		expect(decideOcrOutcome([failed, failed], 0).status).toBe('failed')
	})

	it('completes a receipt whose photos were read and held no items', () => {
		expect(decideOcrOutcome([read(0), read(0)], 0)).toEqual({ status: 'completed', partial: false })
	})

	it('completes with the items found when one photo failed, and says it is partial', () => {
		expect(decideOcrOutcome([read(12), failed], 12)).toEqual({ status: 'completed', partial: true })
	})

	it('fails when one photo was read with no items and the other failed', () => {
		expect(decideOcrOutcome([read(0), failed], 0).status).toBe('failed')
	})
})
