# import httpx
# import requests
# import time
#
# # Configuration
# CLIENT_ID = "python-service"
# CLIENT_SECRET = "super-secret-key"
# TOKEN_URL = "http://localhost:8081/api/v1/auth/client-token"  # Adjust port/host
# SERVICE_URL = "http://localhost:9191/api/v1/interviews/some-endpoint"  # API Gateway URL
#
# # Token cache
# token = None
# expiration_time = 0
#
# async def get_token():
#     global token, expiration_time
#     if time.time() < expiration_time:
#         return token
#
#     async with httpx.AsyncClient() as client:
#         payload = {"client_id": CLIENT_ID, "client_secret": CLIENT_SECRET}
#         response = await client.post(TOKEN_URL, json=payload)
#         response.raise_for_status()
#         token_data = response.json()
#         token = token_data["accessToken"]
#         expiration_time = time.time() + 86400
#         return token
#
# def call_springboot_service():
#     try:
#         current_token = get_token()
#         headers = {"Authorization": f"Bearer {current_token}"}
#         response = requests.get(SERVICE_URL, headers=headers)
#         response.raise_for_status()
#         return response.json()
#     except requests.exceptions.RequestException as e:
#         print(f"Error calling Spring Boot service: {e}")
#         return None
#
# # Usage
# if __name__ == "__main__":
#     result = call_springboot_service()
#     if result:
#         print("Response:", result)