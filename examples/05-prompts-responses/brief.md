Explore ce dépôt sans rien modifier. Ton résumé s'adresse à : {{ audience }}.

Tu travailles sur la branche `{{ WORK_BRANCH }}`.

Voici les fichiers suivis par Git :

!`git ls-files`

Réponds uniquement avec un objet JSON entre <summary> et </summary> :

<summary>
{
  "name": string,
  "purpose": string,          // en une phrase
  "files": string[],          // les fichiers importants
  "difficulty": "easy" | "medium" | "hard"
}
</summary>

Termine ta réponse par <outpost>done</outpost>.
