Delete all folders in this directory to reset migrations. Then run:

npx prisma migrate dev --name init

to generate a fresh migration from the current schema. This will unify all image fields to image_path.
