import requests
import json

username = "zeuz.edits"
print(f"=== DIAGNOSTIC FETCH FOR @{username} ===")

# 1. web_profile_info API with multiple headers
headers_api = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "x-ig-app-id": "936619743392459",
    "Accept": "*/*",
    "Sec-Fetch-Site": "same-origin",
    "Referer": f"https://www.instagram.com/{username}/"
}
try:
    res1 = requests.get(f"https://www.instagram.com/api/v1/users/web_profile_info/?username={username}", headers=headers_api, timeout=5)
    print("\n1. web_profile_info Status:", res1.status_code)
    if res1.status_code == 200:
        data1 = res1.json()
        u1 = data1.get("data", {}).get("user", {})
        print("   -> followers:", u1.get("edge_followed_by", {}).get("count"))
        print("   -> following:", u1.get("edge_follow", {}).get("count"))
        print("   -> posts:", u1.get("edge_owner_to_timeline_media", {}).get("count"))
    else:
        print("   -> body:", res1.text[:200])
except Exception as e:
    print("1. Error:", e)

# 2. ?__a=1&__d=dis endpoint
headers_a1 = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    "Accept": "*/*",
    "Sec-Fetch-Site": "same-origin",
    "Referer": f"https://www.instagram.com/{username}/"
}
try:
    res2 = requests.get(f"https://www.instagram.com/{username}/?__a=1&__d=dis", headers=headers_a1, timeout=5)
    print("\n2. ?__a=1&__d=dis Status:", res2.status_code)
    if res2.status_code == 200:
        try:
            data2 = res2.json()
            u2 = data2.get("graphql", {}).get("user", {}) or data2.get("data", {}).get("user", {})
            print("   -> followers:", u2.get("edge_followed_by", {}).get("count"))
        except Exception:
            print("   -> Not JSON, length:", len(res2.text))
    else:
        print("   -> body:", res2.text[:200])
except Exception as e:
    print("2. Error:", e)

# 3. Instagram Embed endpoint /embed/
try:
    res3 = requests.get(f"https://www.instagram.com/{username}/embed/", headers={"User-Agent": "Mozilla/5.0"}, timeout=5)
    print("\n3. /embed/ Status:", res3.status_code)
    if res3.status_code == 200:
        import re
        f3 = re.findall(r'([\d,\.KMBkm]+)\s*Followers', res3.text, re.I)
        print("   -> regex followers in embed:", f3)
except Exception as e:
    print("3. Error:", e)
