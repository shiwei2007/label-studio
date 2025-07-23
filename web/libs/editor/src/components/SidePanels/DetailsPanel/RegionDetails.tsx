import { observer } from "mobx-react";
import { type FC, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { getRoot } from "mobx-state-tree";
import { Block, Elem, cn, useBEM } from "../../../utils/bem";
import { RegionEditor } from "./RegionEditor";
import "./RegionDetails.scss";
import { Typography } from "@humansignal/ui";
import { IconMicrophone, IconTrash, IconSave } from "@humansignal/icons";
import { SpeechRecorderModal } from "../../SpeechRecorder/SpeechRecorderModal";

const TextResult: FC<{ mainValue: string[] }> = observer(({ mainValue }) => {
  return (
    <div className="flex flex-col items-start gap-tighter">
      {mainValue.map((value: string, i: number) => (
        <mark
          key={`${value}-${i}`}
          className="bg-primary-background px-tighter py-tightest rounded-sm text-neutral-content"
        >
          <Typography data-counter={i + 1} size="small" className="!m-0">
            {value}
          </Typography>
        </mark>
      ))}
    </div>
  );
});

const ChoicesResult: FC<{ mainValue: string[] }> = observer(({ mainValue }) => {
  return (
    <mark className="bg-primary-background px-tighter py-tightest rounded-sm">
      <Typography as="span" size="small" className="text-neutral-content">
        {mainValue.join(", ")}
      </Typography>
    </mark>
  );
});

const RatingResult: FC<{ mainValue: string[] }> = observer(({ mainValue }) => {
  return <span>{mainValue}</span>;
});

export const ResultItem: FC<{ result: any }> = observer(({ result }) => {
  const { type, mainValue } = result;
  /**
   * @todo before fix this var was always false, so fix is left commented out
   * intention was to don't show per-region textarea text twice —
   * in region list and in region details; it failed but there were no complaints
   */
  // const isRegionList = from_name.displaymode === PER_REGION_MODES.REGION_LIST;

  const content = useMemo(() => {
    if (type === "rating") {
      return (
        <Elem name="result">
          <Typography size="small">Rating: </Typography>
          <Elem name="value">
            <RatingResult mainValue={mainValue} />
          </Elem>
        </Elem>
      );
    }
    if (type === "textarea") {
      return (
        <Elem name="result">
          <Typography size="small">Text: </Typography>
          <Elem name="value">
            <TextResult mainValue={mainValue} />
          </Elem>
        </Elem>
      );
    }
    if (type === "choices") {
      return (
        <Elem name="result">
          <Typography size="small">Choices: </Typography>
          <Elem name="value">
            <ChoicesResult mainValue={mainValue} />
          </Elem>
        </Elem>
      );
    }
    if (type === "taxonomy") {
      return (
        <Elem name="result">
          <Typography size="small">Taxonomy: </Typography>
          <Elem name="value">
            <ChoicesResult mainValue={mainValue.map((v: string[]) => v.join("/"))} />
          </Elem>
        </Elem>
      );
    }
  }, [type, mainValue]);

  return content ? <Block name="region-meta">{content}</Block> : null;
});

export const RegionDetailsMain: FC<{ region: any }> = observer(({ region }) => {
  return (
    <>
      <Elem name="result">
        {(region?.results as any[]).map((res) => (
          <ResultItem key={res.pid} result={res} />
        ))}
        {region?.text ? (
          <Block name="region-meta">
            <Elem name="item">
              <Elem name="content" mod={{ type: "text" }}>
                {region.text.replace(/\\n/g, "\n")}
              </Elem>
            </Elem>
          </Block>
        ) : null}
      </Elem>
      <RegionEditor region={region} />
    </>
  );
});

type RegionDetailsMetaProps = {
  region: any;
  editMode?: boolean;
  cancelEditMode?: () => void;
};

export const RegionDetailsMeta: FC<RegionDetailsMetaProps> = observer(({ region, editMode, cancelEditMode }) => {
  const bem = useBEM();
  const metaBem = cn("region-meta");
  const input = useRef<HTMLTextAreaElement | null>();
  const [comment, setComment] = useState("");
  const currentUser = getRoot(region).user;

  const saveComment = (value: string) => {
    const text = value.trim();
    if (text) {
      const user = currentUser?.displayName || currentUser?.username || "User";
      region.addMetaComment(user, text);
    }
    setComment("");
  };

  const [recorderVisible, setRecorderVisible] = useState(false);
  const appendVoiceText = useCallback((voiceText: string) => {
    setComment((prev) => `${prev}${prev ? " " : ""}${voiceText}`);
  }, []);

  useEffect(() => {
    if (editMode && input.current) {
      const { current } = input;

      current.focus();
      current.setSelectionRange(current.value.length, current.value.length);
    }
  }, [editMode]);

  return (
    <>
      {editMode && (
        <div className={bem.elem("meta-text").toClassName()}>
          <textarea
            ref={(el) => (input.current = el)}
            placeholder="Add comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={() => setRecorderVisible(true)}
            className={bem.elem("voice").toClassName()}
            aria-label="Voice input"
          >
            <IconMicrophone width={16} height={16} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={() => {
              saveComment(comment);
              cancelEditMode?.();
            }}
            className={bem.elem("save").toClassName()}
            aria-label="Save comment"
          >
            <IconSave width={16} height={16} />
          </button>
        </div>
      )}
      {region.meta?.comments?.length ? (
        <div className={metaBem.elem("comments").toClassName()}>
          {[...region.meta.comments]
            .sort((a: any, b: any) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
            .map((c: any, i: number) => (
              <div className={metaBem.elem("comment").toClassName()} key={i}>
                <div className={metaBem.elem("comment-head").toClassName()}>
                  <span>{c.user}</span>
                  <time>{new Date(c.datetime).toLocaleDateString()}</time>
                </div>
                <button
                  type="button"
                  aria-label="Delete comment"
                  className={metaBem.elem("comment-delete").toClassName()}
                  onClick={() => region.deleteMetaComment(c.datetime)}
                >
                  <IconTrash width={12} height={12} />
                </button>
                <div className={metaBem.elem("comment-text").toClassName()}>{c.text}</div>
              </div>
            ))}
        </div>
      ) : null}
      <SpeechRecorderModal
        visible={recorderVisible}
        onCancel={() => setRecorderVisible(false)}
        onDone={appendVoiceText}
      />
    </>
  );
});
