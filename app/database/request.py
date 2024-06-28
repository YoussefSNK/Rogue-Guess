import json
import os

def extract_names_from_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    names = [item['name'] for item in data if 'name' in item and item.get('apiGeneration') == 1]
    return names

# Construire le chemin absolu du fichier JSON
file_path = os.path.join(os.path.dirname(__file__), 'pokemon.json')

names_list = extract_names_from_json(file_path)
names_list = sorted(names_list)
# print(names_list)


for i in names_list:
    print(i)


def request_maker(list_de_con, theme):
    for i in list_de_con:
        print(f'("{i}", "{theme}", "{i}.png"),')



list = ["Mark Evans", "Nathan Swift", "Jack Wallside", "Jim Wraith", "Tod Ironside", "Steve Grim", "Timmy Saunders", "Sam Kincaid", "Maxwell Carson", "Axel Blaze", "Kevin Dragonfly", "William Glass", "Bobby Shearer", "Jude Sharp", "Erik Eagle", "Shadow Cimmerian", "Byron Love", "Shawn Froste", "Scotty Banyan", "Suzette Hartland", "Darren LaChance", "Hurley Kane", "Archer Hawkins", "Thor Stoutberg", "Austin Hobbes"]
list2 = ["Kha'Zix", "Kindred", "Kled", "Kog'Maw", "Leblanc", 
        "Lee Sin", "Leona", "Lillia","Lissandra", "Lucian", "Lulu", "Lux",
        "Malphite", "Malzahar", "Maokai", "Maître Yi", "Milio", "Miss Fortune",
        "Mordekaiser", "Morgana", "Naafiri", "Nami", "Nasus", "Nautilus", "Neeko",
        "Nidalee", "Nilah", "Nocturne", "Nunu et Willump", "Olaf", "Orianna", 
        "Ornn", "Pantheon", "Poppy", "Pyke", "Qiyana", "Quinn", "Rakan", "Rammus",
        "Rek'Sai", "Rell", "Renata Glasc", "Renekton", "Rengar", "Riven", "Rumble", 
        "Ryze", "Samira", "Sejuani", "Senna", "Sett", "Shaco", "Shen", "Shyvana",
        "Singed", "Singed", "Sion", "Sivir", "Skarner", "Smolder", "Sona",
        "Soraka", "Swain","Sylas","Syndra","Séraphine","Tahm Kench", "Taliyah", 
        "Talon", "Taric", "Teemo", "Thresh", "Tristana", "Trundle", "Tryndamere",
        "Twisted Fate", "Twitch", "Udyr", "Urgot", "Varus", "Vayne", "Veigar", 
        "Vel'Koz", "Vex", "Vi", "Viego", "Viktor", "Vladimir", "Volibear", "Warwick",
        "Wukong", "Xayah", "Xerath", "Xin Zhao", "Yasuo", "Yone", "Yorick", "Yuumi",
        "Zac", "Zed", "Zeri", "Ziggs", "Zilean", "Zoé", "Zyra"]




#for i in list:
#print(f'("{i}", "Inazuma Eleven", "{i}.png"),')

# for i in list2:
#     print(f'("{i}", "League of legends", "{i}.png"),')


# request_maker(list, "Inazuma Eleven")

# request_maker(names_list, "Pokémon 1G")