import { setPermissions } from "#s3";

export default eventHandler(async (event) => {
	setPermissions(event, {
		bucket: {
			create: false,
			delete: false,
			list: false,
		},
		object: {
			create: true,
			delete: true,
			list: false,
			read: true,
			update: true,
		},
	});
});
