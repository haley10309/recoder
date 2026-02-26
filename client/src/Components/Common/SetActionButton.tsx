import styled from "styled-components";
import * as MuiIcons from "@mui/icons-material"

const ActionButton = styled.button<{ color?: string; icon?: string; width?: number }>`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    border: 1px solid rgb(168, 168, 168);
    background-color: ${({ color }) => color || "white"};
    font-size: 13px;
    border-radius: 5px;
    width: ${({ width }) => (width ? `${width}px` : "130px")};
    width: 130px;
    height: 30px;
    padding: 3px 5px;
    cursor: pointer;

    &:hover {
        background-color: rgb(220, 220, 220);
    }
`;

const ActionButtonWrapper = ({ color, icon, width, children, ...props }: {
    color?: string;
    icon?: string;
    width?: number;
    children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const Icon = icon ? (MuiIcons as any)[icon] : null;

    return (
        <ActionButton color={color} {...props}>
            {Icon && <Icon sx={{ fontSize: 14, color: "black" }} />}
            {children}
        </ActionButton>
    );
};

export default ActionButtonWrapper;