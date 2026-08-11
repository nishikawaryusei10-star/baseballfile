import os
import json

def generate_json():
    search_data = []
    # 定義要掃描的資料夾與對應標籤
    folders = {
        "players": "台灣球員",
        "teams": "球隊",
        "league": "聯盟",
        "stadium": "球場",
        "term": "選秀/獎項",
        "games": "賽事",
        "usaplayers": "美國球員",
        "japanplayers": "日本球員",
        "mexicoplayers": "墨西哥球員",
        "highschool": "高中球隊",
        "domplayers": "多明尼加球員",
        "venplayers": "委內瑞拉球員",
        
    }

    for folder, tag in folders.items():
        if os.path.exists(folder):
            for filename in os.listdir(folder):
                if filename.endswith(".html") and "_overview" not in filename:
                    title = filename.replace(".html", "")
                    search_data.append({
                        "title": title,
                        "url": f"{folder}/{filename}",
                        "tag": tag
                    })

    with open("data.json", "w", encoding="utf-8") as f:
        json.dump(search_data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    generate_json()
