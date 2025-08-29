import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

class FileUploader {
	
	private static s3 = new S3Client({region: process.env.AWS_REGION});
	private static bucket = "furniture-helper";
	private static folder = "product-page-content";
	
	private readonly pageUrl: string;
	private readonly content: string;
	
	constructor(pageUrl: string, content: string) {
		this.pageUrl = pageUrl.replace("https://", "").replace(/\//g, "");
		this.content = content;
	}
	
	public async uploadFile() {
		const key = `${FileUploader.folder}/${this.pageUrl.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
		const uploadParams = {
			Bucket: FileUploader.bucket,
			Key: key,
			Body: this.content,
			ContentType: "text/html"
		};
		await FileUploader.s3.send(new PutObjectCommand(uploadParams));
		return `https://${FileUploader.bucket}.s3.eu-west-1.amazonaws.com/${key}`;
	}
	
}

export default FileUploader;