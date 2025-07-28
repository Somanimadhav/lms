import { createContext, useContext, useState } from "react";

const IssuedBooksContext = createContext();

export const IssuedBooksProvider = ({ children }) => {
  const [issuedBooks, setIssuedBooks] = useState([]);

  return (
    <IssuedBooksContext.Provider value={{ issuedBooks, setIssuedBooks }}>
      {children}
    </IssuedBooksContext.Provider>
  );
};

export const useIssuedBooks = () => useContext(IssuedBooksContext);
