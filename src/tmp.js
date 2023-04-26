function getGreetingForLanguage (language) { 
  switch (language) {
   case "French": return "Bonjour";
   case "Spanish": return "Hola";
   case "German": return "Guten Tag";
   default: return "Hello";
  }
}

function getUserGreeting (language, firstName, middleName, lastName) {
  const str = [firstName, middleName, lastName].filter(Boolean).join(' ');
  return `${getGreetingForLanguage(language)} ${str}`;
}

function getDisplayName (user) { return (user && user.username) ? user.username : 'Guest' } 
const getDisplayName = (user) => (user && user.username) ? user.username : 'Guest'