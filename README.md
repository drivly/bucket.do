# bucket.do
R2 Utilities including Import, Export, etc

### Specification

#### Writing a file
`/write/:urlToImport`

Imports a URL into the R2 bucket, uses the URL path including hostname as the storage key. Can provide `?filename` to change the filename of the final object.

#### Reading a file
`/read/:urlPath`

Reads a file, including all of the original headers when imported and Content-Type.

#### List all files in bucket
`/list/:prefix`

Lists all objects stored within the bucket with a prefix option to filter results. Pagination supported by `?cursor`.