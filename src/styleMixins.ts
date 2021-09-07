import styled from 'styled-components';

export const buttonColor = '#724cf9';
export const buttonHover = '#6b4ecf';
export const buttonClicked = '#573eb0';

export const confirmButton = `
  transition: background-color 100ms ease-in-out;
  width: 150px;
  height: 50px;
  letter-spacing: 0.5px;
  background-color: ${buttonColor};
  color: white;
  font-size: 2em;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: ${buttonHover};
  }
  &:active {
    background-color: ${buttonClicked};
  }
`;

export const controlButton = (left: number): string => `
  color: #fff;
  transition: all 100ms ease-in-out;
  width: 30px;
  height: 30px;
  position: fixed;
  top: 5px;
  left: ${left}px;
  background-color: ${buttonColor};
  box-shadow: 0 0 10px ${buttonColor};
  border-radius: 5px;
  border: 5px #000;
  text-align: center;
  padding: 5px;
  &:hover {
    background-color: ${buttonHover};
    box-shadow: 0 0 10px ${buttonHover};
    transform: scale(105%);
  }
  &:active {
    background-color: ${buttonClicked};
    box-shadow: 0 0 10px ${buttonClicked};
    transform: scale(105%);
  }
  svg {
    transition: color 100ms ease-in-out;
    transition: opacity 100ms ease-in-out;
  }
`;

export const smolText = `
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: xx-large;
  color: rgb(179, 179, 179);
`;

export const animationChild = (
  delay: number,
  top: number,
  left: number,
): string => `
  animation-delay: ${delay}s;
  &:after {
    top: ${top}px;
    left: ${left};
  }
`;

export const SmallText = styled.small`
  ${smolText}
`;

export const Anchor = styled.a<{ hoverColor: string }>`
  transition: color 100ms ease-in-out;
  margin: 5px;
  text-decoration: none;
  color: ${({ color }) => color};
  &:hover {
    color: ${({ hoverColor }) => hoverColor};
  }
`;

export const Footer = styled.footer`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 50px;
  bottom: 0;
  left: 0;
  z-index: 1;
  padding: 5px;
  margin: 0;
  border-top: 1px solid white;
  background-color: ${({ theme }) => theme.colors.backgroundColor};
  color: ${({ theme }) => theme.colors.color};
`;