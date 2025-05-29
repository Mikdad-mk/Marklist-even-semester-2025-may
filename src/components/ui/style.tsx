import React from "react";

interface StyleProps {
  children: string;
  jsx?: boolean;
  global?: boolean;
}

export const Style = ({ children, ...props }: StyleProps) => {
  const { jsx, global, ...rest } = props;
  return <style dangerouslySetInnerHTML={{ __html: children }} {...rest} />;
};
