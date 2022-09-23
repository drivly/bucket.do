name = "bucket-do"
route = { pattern = "*/*", zone_id = "3c73828fa30b1e6840070cf6c242eb5e" }
main = "worker.js"
compatibility_date = "2022-08-23"

services = [
  { binding = "CTX", service = "ctx-do", environment = "production" }
]

[[r2_buckets]]
binding = 'BUCKET' 
bucket_name = 'https://b6641681fe423910342b9ffa1364c76d.r2.cloudflarestorage.com/bucket'
