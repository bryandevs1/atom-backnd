import { useState, useRef, useEffect } from "react";
import styled from "styled-components";

const DropdownMenu = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <MenuContainer ref={dropdownRef}>
      <MenuButton onClick={() => setIsOpen(!isOpen)}>
        <Dot>•</Dot>
        <Dot>•</Dot>
        <Dot>•</Dot>
      </MenuButton>

      {isOpen && (
        <DropdownList>
          {items.map((item, index) => (
            <DropdownItem
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
            >
              {item.label}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </MenuContainer>
  );
};

// Styled components
const MenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Dot = styled.span`
  font-size: 8px;
  line-height: 4px;
  color: #666;
`;

const DropdownList = styled.ul`
  position: absolute;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 5px 0;
  margin: 0;
  min-width: 150px;
  z-index: 100;
`;

const DropdownItem = styled.li`
  padding: 8px 15px;
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
  }
`;

export default DropdownMenu;
