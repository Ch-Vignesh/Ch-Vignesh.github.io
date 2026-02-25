from bs4 import BeautifulSoup
import sys

def verify_links():
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print("Error: index.html not found")
        return False

    soup = BeautifulSoup(content, 'html.parser')

    # Find the footer section
    footer = soup.find('section', id='contact')
    if not footer:
        print("Footer section with id='contact' not found")
        return False

    # Locate the social icons container more robustly
    # Based on: <div class="mt-4 d-flex gap-4 justify-content-center justify-content-md-end">
    social_icons_div = None
    divs = footer.find_all('div')
    for div in divs:
        classes = div.get('class', [])
        if 'mt-4' in classes and 'd-flex' in classes and 'gap-4' in classes:
             social_icons_div = div
             break

    if not social_icons_div:
        print("Social icons container not found")
        return False

    links = social_icons_div.find_all('a')

    expected_links = {
        'LinkedIn': 'https://www.linkedin.com/in/vignesh-chinthakuntla-888608202/',
        'Github': 'https://github.com/vigneshchinthakuntla'
    }

    unwanted_platforms = ['Instagram', 'YouTube', 'Medium']

    placeholders_found = False
    valid_links_count = 0
    unwanted_found = False

    print("Checking links in footer...")
    for link in links:
        href = link.get('href')
        title = link.get('title')
        print(f"  Found link: title='{title}', href='{href}'")

        if href == '#':
            placeholders_found = True
            print(f"    FAIL: Placeholder found for {title}")

        if title in expected_links:
            if href == expected_links[title]:
                valid_links_count += 1
                print(f"    PASS: Correct link for {title}")
            else:
                 print(f"    FAIL: Incorrect link for {title}. Expected {expected_links[title]}, got {href}")

        if title in unwanted_platforms:
             unwanted_found = True
             print(f"    FAIL: Unwanted platform found: {title}")

    success = True
    if placeholders_found:
        print("Result: Placeholders still exist.")
        success = False

    if unwanted_found:
        print("Result: Unwanted platforms still present.")
        success = False

    if valid_links_count != len(expected_links):
        print(f"Result: Not all expected links found (found {valid_links_count}/{len(expected_links)}).")
        success = False

    if success:
        print("SUCCESS: All links verified.")
        return True
    else:
        print("FAIL: Verification failed.")
        return False

if __name__ == "__main__":
    if verify_links():
        sys.exit(0)
    else:
        sys.exit(1)
