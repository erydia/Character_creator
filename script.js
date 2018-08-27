document.addEventListener('DOMContentLoaded', () => {

    // Pobieranie elementów reprezentujących wyniki z drzewa DOM. 
    const characterSectionEl = document.querySelector('.character-section');
    const characterNameEl = document.querySelector('.character-name'); 
    const characterGenderEl = document.querySelector('.character-gender'); 
    const characterClassesEl = document.querySelector('.character-classes');
    const allSkillsEl = document.querySelector('.all-skills');
    const characterPhotoEl = document.querySelector('.character-photo');

    // Informacje o Twojej postaci. 
    const yourCharacter = {
        name: '',
        gender: 'female',
        look: '',
        class: 'barbarian',
        subclass: {name: '', description: '', url: ''},
        equipments: {startingEquipments: [], url: ''},
        skills: [],
        exp: 0,
    };

    // Zmienna przechowująca URL strony z api.
    const DnDPageURL = 'http://www.dnd5eapi.co/api/classes';
    // Zmienna przechowująca informacje o klasach postaci. 
    let characterClasses = [];  
    // Zmienna przechowująca obiekt w którym znajduje się wybrana klasa postaci.
    let selectedObjectClass;
    // Zmienna, która przechowuje umiejętności postaci.
    let characterSkills;
    // Zmienna przechowująca index wybranej postaci.
    let characterIndex = 0;
    // Zmienna która przechowuje zdjęcia postaci.
    const looks = ['Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'];
    // Zmienna która przechowuje niedozwolone nazwy postaci.
    const incorrectNames = ['kurw', 'chuj', 'jeb']; // <-- itp. itd. 

    // Funkcja która dobiera wygląd postaci adekwatny do wybranej klasy jak i płci.
    const chooseALook = (gender) => {
        // Dodanie odpowiedniego wizerunku postaci zgodnego z płcią.    
        characterPhotoEl.src = `image/${gender}/${looks[characterIndex]}.jpg`;
        characterPhotoEl.alt = looks[characterIndex];
        // Przypisanie wizerunku postaci do zmiennej. 
        yourCharacter.look = `${looks[characterIndex]}.jpg`;      
    };

    // Dobranie odpowiedniego wyglądu postaci, zgodnego z wybraną klasą jak i z płcią. 
    chooseALook(yourCharacter.gender);

    // Funkcja która wyświetla wszystkie klasy postaci w htmlu.
    const displayClasses = () => {
        characterClasses.forEach((el) => {
            // Stworzenie nowego elementu 'option'.
            const newClass = document.createElement('option');
            // Nadanie wartości i tekstu stworzonym obiektom. 
            newClass.value = el.name;
            newClass.innerText = el.name;
            // Dodanie stworzonego elementu do htmla.
            characterClassesEl.appendChild(newClass);
        });
    };

    // Funkcja która wyświetla wszystkie umiejętności klasy w htmlu.
    const dispalySkills = () => {
        // Wyświetlenie wszystkich umiejętności klasy w htmlu.
        characterSkills.forEach((el) => {
            // Stworzenie nowego elementu 'label'.
            const newSkill = document.createElement('label');
            // Stworzenie nowego elementu 'input'.
            const newSkillCheckbox = document.createElement('input');
            // Nadanie do stworzonego input'a typu - checkbox.
            newSkillCheckbox.type = 'checkbox';
            // Nadanie input'owi wartości umiejętności postaci.
            newSkillCheckbox.value = el.name;
            // Dodanie tekstu (umiejętności postaci) do label'a.
            newSkill.innerText = el.name;
            // Nadanie label'owi klasy.
            newSkill.classList.add('skill');
            // Dodanie do htmla stworzone elementy.
            allSkillsEl.appendChild(newSkill);
            newSkill.appendChild(newSkillCheckbox);
        });
    };

    // Funkcja która sprawdza czy nazwa postaci jest prawidłowa.
    const ifTheNameIsCorrect = () => {
        // Pobranie nazwy postaci z inputa
        yourCharacter.name = characterNameEl.querySelector('input').value;
        incorrectNames.forEach((el) => {
            const newRegExp = new RegExp(el, 'gi');
            const thatName = yourCharacter.name.match(newRegExp);
            if (thatName !== null) {
                //Wywołanie błędu nazwy postaci.
                throw new Error('Nie poprawna nazwa postaci!'); 
            } else {
                return yourCharacter.name;
            };
        });
    };

    try {
        (async () => {
            const response = await fetch(DnDPageURL);
            const json = await response.json();
            characterClasses = json.results;
            // Wyświetlenie wszystkich klas postaci w htmlu.
            displayClasses();
        })();
    } catch(err) {
        console.error(err);
    };

    // Nasłuchiwanie na zmiane w płci.
    characterGenderEl.addEventListener('change', () => {
        // Przypisanie wybranej płci do zmiennej.
        yourCharacter.gender = characterGenderEl.value;
        // Dobranie odpowiedniego wyglądu postaci, zgodnego z wybraną klasą jak i z płcią. 
        chooseALook(yourCharacter.gender);
    });

    // Nasłuchiwanie na zmiane klasy postaci.
    characterClassesEl.addEventListener('change', () => {
        // Przypisanie wybranej klasy do zmiennej.
        yourCharacter.class = characterClassesEl.value;
        // Wyczyszczenie umiejętności z poprzedniej wybranej klasy. 
        allSkillsEl.innerHTML = '';
        // Przeszukanie tablicy w celu znalezienia obiektu z wybraną klasą i przypisanie go do zmiennej.         
        selectedObjectClass = characterClasses.find((el) => el.name === yourCharacter.class); 
        selectedObjectClass = selectedObjectClass.url;
        
        try {
            (async () => {
                // Odwiedzenie strony z wybraną klasą postaci i zwrócenie promisa.
                const responseCharacter = await fetch(selectedObjectClass);
                const jsonCharacter = await responseCharacter.json();

                // Przypisanie do zmiennej podklasy wybranej klasy.
                yourCharacter.subclass.name = jsonCharacter.subclasses[0].name;
                yourCharacter.subclass.url = jsonCharacter.subclasses[0].url;
                // Przypisanie do zmiennej adresu url, który zawiera startowy sprzęt wybranej klasy postaci.
                yourCharacter.equipments.url = jsonCharacter.starting_equipment.url; 
                // Przypisanie do zmiennej wartości promisa - wszystich umiejętności wybranej klasy.      
                characterSkills = jsonCharacter.proficiency_choices[0].from;            
                // Przypisanie do zmiennej wartości promisa - indexu wybranej postaci.
                characterIndex = jsonCharacter.index;
                // Zmniejszenie indexu wybranej postaci, aby spasować go z tablicą. 
                characterIndex -= 1;

                // Dobranie odpowiedniego wyglądu postaci, zgodnego z wybraną klasą jak i z płcią. 
                chooseALook(yourCharacter.gender);
                // Wyświetlenie wszystkich umiejętności klasy w htmlu.
                dispalySkills();  
                // Usunięcie zawartości tablicy umiejętności z poprzedniej wybranej klasy postaci.
                if (yourCharacter.skills.length > 0) {
                    yourCharacter.skills = [];
                };

                // Nasłuchiwanie na wybranie umiejętności.
                allSkillsEl.addEventListener('change', (evt) => {
                    // Przypisanie do zamiennej informacji o wybraniu.
                    const isItChecked = evt.target.checked;
                    // Dodanie umiejętności do tablicy.
                    if (isItChecked === true) {
                        // Sprawdzenie czy w tablicy znajduje się już umiejętność o takiej wartości.
                        const thatSkill = yourCharacter.skills.includes(evt.target.value);
                        // Dodanie umiejętności do tablicy.
                        if (thatSkill === false) {
                            // Pobranie obiektu z tablicy zgodnego z wybraną umiejętnością.
                            let thatSkill = characterSkills.find((el) => el.name === evt.target.value);
                            // Usunięcie przedrostka 'Skill:'.
                            if (yourCharacter.class !== 'Monk') {
                                evt.target.value = evt.target.value.replace('Skill: ', '');
                            };  
                            // Stworzenie obiektu składającego się z nazwy umiejętności i url.
                            const object = { skill: evt.target.value, url: thatSkill.url };
                            // Dodanie nowego obiektu do tablicy.
                            yourCharacter.skills.push(object);
                        };
                    };                                                 
                });

                // Odwiedzenie strony ze startowym sprzetem wybranej klasy postaci i zwrócenie promisa.
                const responseEq = await fetch(yourCharacter.equipments.url);
                const jsonEq = await responseEq.json();
                // Przypisanie do zmiennej obiektów z startowym sprzętem wybranej klasy.
                const startingEquipments = jsonEq.starting_equipment;
                // Usuniecie zawartości tablicy sprzętu z poprzedniej wybranej klasy postaci.
                if ( yourCharacter.equipments.startingEquipments.length > 0 ){
                    yourCharacter.equipments.startingEquipments = [];
                };  
                // Wypełnienie tablicy nazwami sprzętu startowego. 
                startingEquipments.forEach((el) => {
                    yourCharacter.equipments.startingEquipments.push(el.item.name); 
                });

                // Odwiedzenie strony z podklasą wybranej klasy postaci i zwrócenie promisa.
                const responseSubclass = await fetch(yourCharacter.subclass.url);
                const jsonSubclass = await responseSubclass.json();
                // Przypisanie do zmiennej opisu podklasy.
                yourCharacter.subclass.description = jsonSubclass.desc[0];
            })();
        } catch(err) {
            console.error(err);
        };   
    });    
                
    // Stworzenie postaci.
    document.querySelector('button').addEventListener('click', () => {            
        // Sprawdzenie czy nazwa postaci jest prawidłowa.
        ifTheNameIsCorrect();
        // Wyświetlenie postaci w konsoli.
        console.log(yourCharacter);

        // Usunięcie wszystkich inputów.
        characterSectionEl.innerHTML = '';
        // Stworzenie elementu, który będzie zawierał nazwe postaci.
        const nameCharacter = document.createElement('h1');
        nameCharacter.innerText = yourCharacter.name;
        // Stworzenie elementu, który będzie zawierał klase postaci.
        const classCharacter = document.createElement('h3');
        classCharacter.innerText = yourCharacter.class;
        // Stworzenie elementów, które będą zawierać umiejętności postaci.
        const skillSection = document.createElement('ul');
        skillSection.innerText = 'Skills:';
        yourCharacter.skills.forEach((el) => {
            const skillCharacter = document.createElement('li');
            skillCharacter.innerText = el.skill;
            skillSection.appendChild(skillCharacter);
        });

        // Dodanie stworzonych elementów do html'a.
        characterSectionEl.appendChild(nameCharacter);
        characterSectionEl.appendChild(classCharacter);
        characterSectionEl.appendChild(skillSection);
    }); 

});