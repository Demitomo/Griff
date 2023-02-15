const log = (message: string) => { console.log("[LOG] " + message); }
const warn = (message: string) => { console.warn("[WARN] " + message); }
const err = (message: string) => { console.error("[ERROR] " + message); }

const selPage = "login";

const pseudoRegex = new RegExp("^[a-zA-Z0-9_]{3,16}$");
const serverRegex = new RegExp("^(https?://)?([a-zA-Z0-9]+([-.]{1}[a-zA-Z0-9]+)*.[a-zA-Z]{2,5}|localhost)(:[0-9]{1,5})?(/.*)?$");
const passwordRegex = new RegExp("^[\\s\\S]{7,64}$");

if(selPage === "login") {
    const pseudo = document.getElementById("pseudo") as HTMLInputElement;
    const server = document.getElementById("server") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;
    const submit = document.getElementById("submit") as HTMLInputElement;

    const errorDisplay = document.getElementById("errorDisplay") as HTMLInputElement;

    const isValid = () => {
        try {
            if(pseudo.value === "") throw "Pseudo is empty";
            if(server.value === "") throw "Server is empty";
            if(password.value === "") throw "Password is empty";
            if(!pseudoRegex.test(pseudo.value)) throw "Pseudo is invalid";
            if(!serverRegex.test(server.value)) throw "Server is invalid";
            if(!passwordRegex.test(password.value)) throw "Password is invalid";
            return true;
        }
        catch(err) {
            if(errorDisplay !== null) errorDisplay.innerText = err;
            else alert(err);
            return false;
        }
    }

    submit.addEventListener("click", () => {
        if(isValid()) {
            console.log("Valid");
            const credentials = {
                pseudo: pseudo.value,
                password: password.value,
                server: server.value + "/api",
                token: ""
            }

            const params = new URLSearchParams();
            params.append("username", credentials.pseudo);
            params.append("password", credentials.password);


            fetch(credentials.server + "/login.php", {
                method: "POST",
                body: params


            }).then(res => res.json())
            .then(data => {
                log(data);
                try {
                    if(data === null) throw "La réponse est vide, veuillez réessayer";
                    //if(data.status !== 200) throw "La requête a échoué, veuillez réessayer";
                    if(data.success !== true) throw "Le serveur a renvoyé une erreur, veuillez réessayer";

                    if(data.logged === true) {
                        const token = data.token;
                        if(token === null) throw "Le token est vide, veuillez réessayer";
                        if(token === undefined) throw "Le token est vide, veuillez réessayer";
                        if(token === "") throw "Le token est vide, veuillez réessayer";

                        credentials.token = data.token;

                        // @ts-ignore
                        api.saveCredentials(credentials);
                        errorDisplay.innerText = "Connexion réussie";
                        errorDisplay.style.color = "green";
                        //TODO: Redirect to main page
                    }
                    else {
                        throw "Le pseudo ou le mot de passe est incorrect";
                    }

                }
                catch(error) {
                    log(error);
                    err(data.statusText);
                    errorDisplay.innerText = error;
                }

            })
            .catch((error) => {
                err(error.stack);
                err(error);
                errorDisplay.innerText = "Une erreur est survenue lors de la connexion au serveur, veuillez regarder la console pour plus de détails";
            });
        }
        else
        {
            console.log("Invalid");
        }
    });
}