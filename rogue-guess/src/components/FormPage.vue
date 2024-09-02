<template>
  <div class="container">
    <h1 :class="{ 'slide-out-up': animateForm }">Une idée captivante à proposer !?</h1>
    <div class="form-container">
      <form @submit.prevent="submitForm" :class="{ 'slide-out-down': animateForm }">
        <label for="name">Titre :</label>
        <input type="text" id="name" v-model="form.name" placeholder="Votre idée en quelque mots" required />

        <label for="option">Choisissez une option :</label>
        <select id="option" v-model="form.option" required>
          <option value="" disabled>Sélectionnez une option</option>
          <option value="option1">Nouvelle mécanique</option>
          <option value="option2">Liste d'entités</option>
          <option value="option3">Idée de nouveau jeu</option>
          <option value="option4">Report de bug</option>
        </select>

        <label for="message">Message :</label>
        <textarea id="message" v-model="form.message" required></textarea>

        <button type="submit">Envoyer</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        option: '',
        message: ''
      },
      animateForm: false
    };
  },
  methods: {
    async submitForm() {
      try {
        this.animateForm = true; // Déclenche l'animation

        console.log(JSON.stringify(this.form));
        const response = await fetch('http://localhost:3000/formulaire', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.form)
        });

        if (!response.ok) {
          throw new Error('Une erreur est survenue lors de la soumission du formulaire');
        }

        const result = await response.json();
        console.log('Formulaire soumis avec succès :', result);

        setTimeout(
          () => {
            this.$router.push({ name: 'Home' });
          },
          500
        ); // Correspond à la durée de l'animation
      } catch (error) {
        console.error('Erreur lors de la soumission du formulaire :', error);
        // mettre un message d'erreur au joueur #enmodedanger
      } finally {
        setTimeout(() => {
          this.animateForm = false; // Retirer l'animation après un délai
        }, 500); // Correspond à la durée de l'animation
      }
    }
  }
};
</script>

<style scoped>
.container {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #000000;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column; /* Ajouté pour aligner les éléments verticalement */
    height: 100vh;
}

form {
    background-color: #333;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    width: 400px;
    max-width: 90%;
    animation: fadeInUp 0.5s ease-out;
}

h1 {
    text-align: center;
    color: #fff;
    margin-bottom: 20px;
    animation: fadeInDown 0.5s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(150px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideOutDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(150px);
  }
}
.slide-out-down {
  animation: slideOutDown 0.5s ease-out forwards;
}

@keyframes slideOutUp {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
.slide-out-up {
  animation: slideOutUp 0.5s ease-out forwards;
}

label {
    display: block;
    margin-bottom: 10px;
    color: #ccc;
}

input[type="text"],
select,
textarea {
    width: calc(100% - 24px); /* Réduire la largeur pour compenser le padding */
    padding: 12px;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 16px;
    color: #333;
    background-color: #fff;
    transition: border-color 0.3s ease;
}

input[type="text"]:focus,
select:focus,
textarea:focus {
    border-color: #5cb85c;
}

textarea {
    resize: none;
    min-height: 120px;
}

button[type="submit"] {
    background-color: #5cb85c;
    color: #fff;
    padding: 14px 24px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 18px;
    transition: background-color 0.3s ease;
}

button[type="submit"]:hover {
    background-color: #4cae4c;
}

button[type="submit"]:focus {
    outline: none;
}

.error-message {
    color: #d9534f;
    font-size: 14px;
    margin-top: 5px;
}

/* Responsive design */
@media (max-width: 600px) {
    form {
        width: 90%;
    }
}

</style>
