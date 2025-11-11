import type { MouseEventHandler } from "react";

import { IconCommentLinkTo, IconSend, IconMicrophone } from "@humansignal/icons";
import { Tooltip } from "@humansignal/ui";
import { Block, Elem } from "../../../utils/bem";
import "./CommentFormButtons.scss";

export const CommentFormButtons = ({
  region,
  linking,
  onLinkTo,
  onVoice,
  voiceActive,
}: {
  region: any;
  linking: boolean;
  onLinkTo?: MouseEventHandler<HTMLElement>;
  onVoice?: MouseEventHandler<HTMLElement>;
  voiceActive?: boolean;
}) => (
  <Block name="comment-form-buttons">
    <Elem name="buttons">
      {onLinkTo && !region && (
        <Tooltip title="Link to...">
          <Elem name="action" tag="button" mod={{ highlight: linking }} onClick={onLinkTo}>
            <IconCommentLinkTo />
          </Elem>
        </Tooltip>
      )}
      {onVoice && (
        <Tooltip title="Voice input">
          <Elem name="action" tag="button" mod={{ highlight: voiceActive }} type="button" onClick={onVoice}>
            <IconMicrophone />
          </Elem>
        </Tooltip>
      )}
      <Elem name="action" tag="button" type="submit">
        <IconSend />
      </Elem>
    </Elem>
  </Block>
);
