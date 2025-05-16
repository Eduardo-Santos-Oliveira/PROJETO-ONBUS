import json
import requests
from bs4 import BeautifulSoup

def extrair_dados(url):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        horarios = []
        tabela = soup.find('table')
        if tabela:
            linhas_tabela = tabela.find_all('tr')
            for linha in linhas_tabela[1:]:
                colunas = linha.find_all('td')
                if len(colunas) >= 3:
                    dia = colunas[0].get_text(strip=True)
                    horario = colunas[1].get_text(strip=True)
                    frequencia = colunas[2].get_text(strip=True)
                    horarios.append(f"{dia}: {horario} ({frequencia})")

        rotas = []
        ul_rotas = soup.find('ul', class_='route')
        if ul_rotas:
            for li in ul_rotas.find_all('li'):
                h3 = li.find('h3')
                if h3:
                    rotas.append(h3.get_text(strip=True))

        return {"horarios": horarios, "rotas": rotas}

    except Exception as e:
        print(f"Erro ao acessar {url}: {e}")
        return {"horarios": [], "rotas": []}

def main():
    with open("linhas_com_links.json", "r", encoding="utf-8") as f:
        linhas = json.load(f)

    resultado = []
    for linha in linhas:
        print(f"Processando: {linha['nome']}")
        dados = extrair_dados(linha["url"])
        resultado.append({
            "nome": linha["nome"],
            "url": linha["url"],
            "horarios": dados["horarios"],
            "rotas": dados["rotas"]
        })

    with open("linhas_com_horarios_e_rotas.json", "w", encoding="utf-8") as f:
        json.dump(resultado, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()
