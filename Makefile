build:
	docker build -t vmbot .

run:
	docker run -d -p 3000:3000 --name vmbot --rm vmbot
