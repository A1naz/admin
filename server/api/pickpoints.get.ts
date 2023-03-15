import { User } from "@/server/lib/models/User";
import { getServerSession } from "#auth";
export default eventHandler(async (event) => {
	const session = (await getServerSession(event)) as any;

	if (!session) {
		return sendRedirect(event, "/auth", 302);
	}
	const pickpoints: any = await $fetch(
		"https://gateway.mpboost.pro/api/v1/enrichment/pickpoints",
		{
			method: "GET",
			headers: {
				"x-api-key":
					"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImxrV2pBIiwicm9sZXMiOltdLCJleHAiOjE2Nzg4MjYxMzF9.cS3tx4ZveBqm8L9IHKFExtyOh5RSVizCGGANar1C7LM",
			},
		},
	);
	console.log(pickpoints);
	return {
		pickpoints: pickpoints.items,
	};
});
