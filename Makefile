include .env
export

deploy:
	serverless deploy --region eu-west-1 --stage prod

destroy:
	serverless remove --region eu-west-1 --stage prod

function:
	serverless deploy function --region eu-west-1 --stage prod --function makePdf

invoke:
	serverless invoke --region eu-west-1 --stage prod --log --function makePdf --data '{"body":"{\"email\":\"bjfletcher@gmail.com\"}"}'

logs:
	serverless logs --region eu-west-1 --stage prod --function makePdf

test:
	jest
watch:
	jest --watch