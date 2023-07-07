const components = {
  Button: {
    // // 1. We can update the base styles
    baseStyle: {
      fontWeight: 'bold', // Normally, it is "semibold"
      borderRadius: '50px',
      opacity: 1,
      lineHeight: 2,
    },
    // // 2. We can add a new button size or extend existing
    // sizes: {
    //   xl: {
    //     h: '56px',
    //     fontSize: 'lg',
    //     px: '32px',
    //   },
    // },
    // 3. We can add a new visual variant
    variants: {
      linear: {
        bg: 'linear-gradient(253.75deg, #FFBADB 11.29%, #458FFF 51.72%, #1CFEF0 95.67%)',
      },
      secondary: {
        bg: 'blue.2',
        color: 'blue.1',
        _hover: {
          bg: 'blue.1',
          color: 'white',
        },
      },
      primary: {
        // 这么写是为了 hover over 不会突变
        bg: 'linear-gradient(225deg, #0000FF 0%, #0000FF 100%)',
        // bg: 'blue.1',
        color: 'white',
        _disabled: {
          bg: 'gray.1',
          opacity: 1,
        },
        _hover: {
          bg: 'linear-gradient(225deg, #0000FF 0%, #9500E0 100%)',
          _disabled: {
            bg: 'gray.1',
            opacity: 1,
          },
        },
        _loading: {
          color: 'gray.3',
        },
        _focusVisible: {
          boxShadow: 'none',
        },
      },
      other: {
        bg: 'blue.3',
        color: 'white',
        _disabled: {
          bg: 'gray.1',
          opacity: 1,
        },
        _hover: {
          _disabled: {
            bg: 'gray.1',
            opacity: 1,
          },
        },
      },
      primaryLink: {
        bg: 'white',
        color: 'blue.1',
        _hover: {
          opacity: 0.5,
        },
        borderRadius: 8,
      },
      link: {
        color: 'blue.1',
      },
      outline: {
        borderColor: 'blue.1',
        color: 'blue.1',
        _hover: {
          bg: 'white',
          opacity: 0.8,
        },
      },
      outlineOther: {
        color: 'blue.1',
        bg: 'white',
        _hover: {
          bg: 'blue.2',
          opacity: 0.8,
        },
        _focusVisible: {
          boxShadow: 'none',
        },
      },
      // // 5. We can add responsive variants
      // sm: {
      //   bg: 'teal.500',
      //   fontSize: 'md',
      // },
    },
    defaultProps: {
      size: 'md', // default is md
    },
  },
}

export default components
