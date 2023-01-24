import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => {
  return {
    menuIcon: {
      marginRight: "0.5rem",
    },
    grayCard: {
      filter: "grayscale(100%) blur(0.5px)",
    },
    toolBar: {
      marginLeft: "0.5rem",
    },
    inputFormContainer: {
      marginBottom: "1rem",
      marginTop: "5rem",
    },
    googleButton: {
      marginLeft: "auto",
      marginRight: "0.5rem",
    },
    sampleNotAvailable: {
      filter: "grayscale(100%) blur(0.5px)",
    },
  };
});

// TODO jss-to-tss-react codemod: usages of this hook outside of this file will not be converted.
export default useStyles;
