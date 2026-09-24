// Below is an example of a workflow that generates a daily recap for a user.
// It uses the AI to generate a text recap, then uses the AI to generate an image prompt,
// then uses the AI to generate an image, then stores the image in R2, and finally adds the recap to the database.

import {WorkflowEntrypoint  } from "cloudflare:workers";
import type {WorkflowEvent, WorkflowStep} from "cloudflare:workers";
import {getDB, moments, recaps, userMeta} from "@acme/db";
import { and, gte, lte, eq } from 'drizzle-orm';

export type DailyRecapWorkflowParams = {
    userId: string;
    timezone: string;
	dev?: boolean
}

const getPacificTime = (date: Date = new Date()) => {
    return new Date(
        date.toLocaleString('en-US', {
            timeZone: 'America/Los_Angeles'
        })
    );
};

export class DailyRecapWorkflow extends WorkflowEntrypoint<Env, DailyRecapWorkflowParams> {
	async run(event: WorkflowEvent<DailyRecapWorkflowParams>, step: WorkflowStep) {
		const { userId, timezone } = event.payload;

		const userMetadata = await step.do('Get user metadata', async () => {
			const db = getDB(this.env);
			const meta = await db.query.userMeta.findFirst({
				where: eq(userMeta.userId, userId),
			});
			return meta;
		});

		const yesterdaysMoments = await step.do('Get moments', async () => {
			const db = getDB(this.env);
			
			// Calculate date range based on dev flag
			const todayPT = getPacificTime();
			const targetDate = new Date(todayPT);
			
			if (!event.payload.dev) {
				// Normal case - get yesterday's moments
				targetDate.setDate(targetDate.getDate() - 1);
			}
			
			const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
			const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

			const res = await db.select()
				.from(moments)
				.where(
					and(
						eq(moments.userId, userId),
						gte(moments.createdAt, startOfDay),
						lte(moments.createdAt, endOfDay)
					)
				);
			
			return res;
		});

		const aiGeneratedRecap: string = await step.do('Generate text from AI', async () => {
			console.log('yesterdaysMoments:', yesterdaysMoments);

			const res  = await this.env.AI.run(
				// @ts-ignore
				"@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
					prompt: `
					Heres what happened yesterday, turn it into a quick little story, maybe add some humor, maybe make it profound, but at the very least make it interesting:
					First moment: 
					${yesterdaysMoments.map(m => m.text).join('\n Next moment:\n')}
					`
				}
			)
			console.log('AI generated recap:', res);

			// @ts-ignore
			return res.response
		});

		const imagePrompt: string = await step.do('Generate image prompt', async () => {
			const res = await this.env.AI.run(
				// @ts-ignore
				"@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
					prompt: `
					Create a detailed image generation prompt that captures the essence of this daily recap. 
					The prompt should be vivid and descriptive, but keep it under 100 words.
					Here's the recap:
					${aiGeneratedRecap}
					`
				}
			);
			console.log('Generated image prompt:', res);

			// @ts-ignore
			return res.response;
		});

		const generatedImage = await step.do('Generate image', async () => {
			const artStyle = userMetadata?.artStyle ?? 'classical painting';
			
			const styleModifiers = {
				'classical painting': 'in the style of a classical oil painting, rich colors, dramatic lighting',
				'ethereal animated fairy': 'in an ethereal fairy tale style, magical, dreamy, soft glowing colors',
				'childrens book': 'in a whimsical children\'s book illustration style, colorful, playful',
				'3d animated style': 'in a modern 3D animated style, vibrant, polished, cinematic',
			};

			const styleModifier = styleModifiers[artStyle as keyof typeof styleModifiers];
			
			const enhancedPrompt = `${imagePrompt} ${styleModifier}`;
			console.log('Enhanced prompt with style:', enhancedPrompt);

			const res = await this.env.AI.run(
				'@cf/black-forest-labs/flux-1-schnell',
				{
					prompt: enhancedPrompt,
					steps: 8,
				},
			);
			if (!res.image) {
				throw new Error('Image generation returned no image data');
			}
			return res.image;
		});

		const imageKey = await step.do('Store image in R2', async () => {
			const imageKey = `recap-images/${Date.now()}.jpg`;
			
			// Convert base64 to Uint8Array using Web APIs
			const binaryString = atob(generatedImage);
			const bytes = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}
			
			await this.env.IMAGES_BUCKET.put(imageKey, bytes, {
				httpMetadata: {
					contentType: 'image/jpeg',
				},
			});
			
			return imageKey;
		});

		await step.do('Add to database', async () => {
			const db = getDB(this.env);
			await db.insert(recaps).values({ 
				text: aiGeneratedRecap, 
				userId: userId,  // Now using the specific user's ID
				createdAt: new Date(), 
				type: 'daily', 
				imageId: imageKey
			});
		});
	}
}
