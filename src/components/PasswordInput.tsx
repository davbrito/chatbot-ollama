import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type"> & {
  toggleLabelShow?: string;
  toggleLabelHide?: string;
};

export function PasswordInput({
  toggleLabelShow = "Mostrar",
  toggleLabelHide = "Ocultar",
  ...props
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <InputGroup>
      <InputGroupInput type={show ? "text" : "password"} {...props} />
      <InputGroupButton
        size="icon-xs"
        aria-label={show ? toggleLabelHide : toggleLabelShow}
        onClick={() => setShow((v) => !v)}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </InputGroupButton>
    </InputGroup>
  );
}

export default PasswordInput;
