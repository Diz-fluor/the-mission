// Generated from the matching Figma screen; behavior lives in src/prototype.
const asset = (path: string) => import.meta.env.BASE_URL + path;
const imgTheMissionIconLocalArrowRight24 = asset("assets/024a5030-1e53-4b90-874e-9ff9d078a886.svg");
const imgTheMissionIconLocalChevronRight20 = asset("assets/03ac6dd8-a71d-4628-a958-26f15aea48eb.svg");
const imgTheMissionIconNavigationFile06 = asset("assets/b4406d06-8001-48b8-8043-2213f8f29ac3.svg");
const imgTheMissionIconArrowLeft = asset("assets/00e9f81a-abd0-4652-bd3e-093181d39546.svg");
const imgTheMissionIconLocalDotsHorizontal24 = asset("assets/017081f7-c97e-4d62-b0e1-111bc030bb6b.svg");
const imgTheMissionIconLocalXClose22 = asset("assets/008777cc-dd08-4982-9c80-52b06064798a.svg");
const img = asset("assets/404b7df4-2061-4732-ba0f-16175b2b252b.svg");
const imgWiFi = asset("assets/01bed147-0a79-4144-9745-f84d3ee5b060.svg");

function TheMissionIconLocalArrowRight24({ className }: { className?: string }) {
  return (
    <div className={className || "dd89972fe17 d8b67f4b35a"} data-node-id="610:5159" data-name="THE MISSION/Icon/Local/arrow-right · 24">
      <img alt="" className="dda4dbfbc4f d0214b4b355 d7b7df0449b d2191c14562 d48bd39401f" src={imgTheMissionIconLocalArrowRight24} />
    </div>
  );
}

function TheMissionIconLocalChevronRight20({ className }: { className?: string }) {
  return (
    <div className={className || "dd89972fe17 dce3921c70e"} data-node-id="610:5745" data-name="THE MISSION/Icon/Local/chevron-right · 20">
      <img alt="" className="dda4dbfbc4f d0214b4b355 d7b7df0449b d2191c14562 d48bd39401f" src={imgTheMissionIconLocalChevronRight20} />
    </div>
  );
}

function TheMissionIconNavigationFile06({ className }: { className?: string }) {
  return (
    <div className={className || "dd89972fe17 d8b67f4b35a"} data-node-id="547:4589" data-name="THE MISSION/Icon/Navigation/file-06">
      <img alt="" className="dda4dbfbc4f d0214b4b355 d7b7df0449b d2191c14562 d48bd39401f" src={imgTheMissionIconNavigationFile06} />
    </div>
  );
}

type TheMissionDealNextStepProps = {
  className?: string;
  detail?: string;
  title?: string;
};

function TheMissionDealNextStep({ className, detail = "Следующий шаг по договорённости", title = "Что дальше" }: TheMissionDealNextStepProps) {
  return (
    <div className={className || "d0f92246acc d9cedb81f50 d507c28c0b9 d60fbb77139 d8dddea0773 df2c06688bf d60541e1e26 d2f3d084c8b d9bb41f8553 dd89972fe17 da0b31f4d50 dc25208f291"} data-node-id="706:5916" data-name="THE MISSION/Deal/Next Step">
      <p className="da05b19b468 de83a7042bc dc2385a463d dd89972fe17 d012fbd121f ddf754f77bd de901727572 d1f77f8419f" data-node-id="706:5917">
        {title}
      </p>
      <p className="d92210b6b0d d8ecebc9f80 d64d9fa1b35 dd89972fe17 d012fbd121f d4d2392e8ee de3a33eb148 d1f77f8419f" data-node-id="706:5918">
        {detail}
      </p>
    </div>
  );
}

type TheMissionDealJourneyProps = {
  className?: string;
  stage?: "Review";
};

function TheMissionDealJourney({ className, stage = "Review" }: TheMissionDealJourneyProps) {
  return (
    <div className={className || "d507c28c0b9 d60fbb77139 d8dddea0773 d166145265e d7ef87877ce d60541e1e26 dd89972fe17 dc25208f291"} data-node-id="706:5887">
      <div className="d0f92246acc d507c28c0b9 d60fbb77139 d9af75481b1 d3960ffc248 d8ef2268efb d08b04966c7 dd89972fe17 d012fbd121f dc25208f291 de82ae8be04" data-node-id="711:6231" data-name="Текущий этап">
        <p className="da05b19b468 de83a7042bc dc3dc13096a dd89972fe17 d012fbd121f dcff55289f8 de901727572" data-node-id="711:6232">
          Проверка результата
        </p>
        <p className="d92210b6b0d d8ecebc9f80 de32ac1aeb2 dd89972fe17 d012fbd121f da14daebf77 de3a33eb148" data-node-id="711:6233">
          Этап 3 из 3
        </p>
      </div>
      <div className="d507c28c0b9 d60fbb77139 df2c06688bf d799d7be85e d60541e1e26 d08b04966c7 dd89972fe17 d012fbd121f dc25208f291" data-node-id="711:6234" data-name="Ход сделки">
        <div className="dbf1cdb0fd1 d799d7be85e dd89972fe17 d687bfbbaf6 d012fbd121f d88a07e5091" data-node-id="711:6235" data-name="Rectangle" />
        <div className="dbf1cdb0fd1 d799d7be85e dd89972fe17 d687bfbbaf6 d012fbd121f d88a07e5091" data-node-id="711:6236" data-name="Rectangle" />
        <div className="dbf1cdb0fd1 d799d7be85e dd89972fe17 d687bfbbaf6 d012fbd121f d88a07e5091" data-node-id="711:6237" data-name="Rectangle" />
      </div>
    </div>
  );
}

function TheMissionIconArrowLeft({ className }: { className?: string }) {
  return (
    <div className={className || "dd89972fe17 d341970947d"} data-node-id="502:2567" data-name="THE MISSION/Icon/arrow-left">
      <img alt="" className="dda4dbfbc4f d0214b4b355 d7b7df0449b d2191c14562 d48bd39401f" src={imgTheMissionIconArrowLeft} />
    </div>
  );
}

function TheMissionIconLocalDotsHorizontal24({ className }: { className?: string }) {
  return (
    <div className={className || "dd89972fe17 d8b67f4b35a"} data-node-id="610:4947" data-name="THE MISSION/Icon/Local/dots-horizontal · 24">
      <img alt="" className="dda4dbfbc4f d0214b4b355 d7b7df0449b d2191c14562 d48bd39401f" src={imgTheMissionIconLocalDotsHorizontal24} />
    </div>
  );
}

function TheMissionIconLocalXClose22({ className }: { className?: string }) {
  return (
    <div className={className || "dd89972fe17 dc3a282964b"} data-node-id="610:4942" data-name="THE MISSION/Icon/Local/x-close · 22">
      <img alt="" className="dda4dbfbc4f d0214b4b355 d7b7df0449b d2191c14562 d48bd39401f" src={imgTheMissionIconLocalXClose22} />
    </div>
  );
}

export default function Component0808() {
  return (
    <div className="dbe09e089c2 d08b04966c7 dd89972fe17 d136a78a532 d48bd39401f" data-node-id="504:3212" data-name="08.08 · Проверить результат">
      <div className="dda4dbfbc4f db974272d25 dc78facc7a0 d2167406b24 dfee8fd5492" data-node-id="587:5885" data-name="Свет · изумруд + мята">
        <img alt="" className="dda4dbfbc4f d0214b4b355 d7b7df0449b d2191c14562 d48bd39401f" src={img} />
      </div>
      <div className="dda4dbfbc4f d48cb7549e2 dc78facc7a0 d08b04966c7 d2167406b24 dfee8fd5492" data-node-id="504:3213" data-name="Статус-бар">
        <p className="d0f92246acc dda4dbfbc4f da05b19b468 de83a7042bc d32bd4c7660 dcbca8e81ab d9669b98a03 da41b9d872f dfa0af41562 de82ae8be04" data-node-id="I504:3213;114:143">
          9:41
        </p>
        <div className="dda4dbfbc4f d69290d51cf d931d1ebf8b dbc06bf8f31 d9fb09cb3db d3986fde4dd de82350d83b" data-node-id="I504:3213;114:144" data-name="Dynamic Island" />
        <div className="dda4dbfbc4f d70585965a0 d51225aaa03 d1f19789392 dce154d3f60 d58c5777eb5 d5f072f4d4b" data-node-id="I504:3213;114:145" data-name="Сигнал" />
        <div className="dda4dbfbc4f d70585965a0 d772f12f4dd d75774e8b86 dce154d3f60 defd78c3eeb d5f072f4d4b" data-node-id="I504:3213;114:146" data-name="Сигнал" />
        <div className="dda4dbfbc4f d70585965a0 ddd2b505357 d98c661e5af dce154d3f60 d151d8b9572 d5f072f4d4b" data-node-id="I504:3213;114:147" data-name="Сигнал" />
        <div className="dda4dbfbc4f d70585965a0 d02e75b435f d468c6e29d3 dce154d3f60 d74ec75e22a d5f072f4d4b" data-node-id="I504:3213;114:148" data-name="Сигнал" />
        <div className="dda4dbfbc4f d566176225e dabcd8d99e2 d74ec75e22a" data-node-id="I504:3213;114:149" data-name="Wi-Fi">
          <div className="dda4dbfbc4f d1b3f7cbd80 d04b0e4d719 d91e2b621e1 d2167406b24">
            <img alt="" className="d0214b4b355 d2191c14562 d48bd39401f" src={imgWiFi} />
          </div>
        </div>
        <div className="dda4dbfbc4f dca6bcd4b6f d143a9107f2 dba4c508992 da98a12b795 d296be40d29 dbc109d48e8 d97c3202983 d820fc6b8ed" data-node-id="I504:3213;114:150" data-name="Батарея" />
        <div className="dda4dbfbc4f d70585965a0 ddd2b505357 d6878d85f28 d04299ba2f7 da0b9ede005 d253451813c" data-node-id="I504:3213;114:151" data-name="Заряд" />
      </div>
      <div className="dda4dbfbc4f db3d3f578a8 dc78facc7a0 d08b04966c7 ded404b2e71 dfee8fd5492" data-node-id="504:3223" data-name="Telegram Mini App · шапка">
        <TheMissionIconLocalXClose22 className="dda4dbfbc4f da4f50d8dd7 dc3a282964b dfa0af41562" />
        <TheMissionIconLocalDotsHorizontal24 className="dda4dbfbc4f d9ef8e44ecc d8b67f4b35a dfa0af41562" />
        <p className="defaa070148 d0f92246acc dda4dbfbc4f da05b19b468 de83a7042bc d64d9fa1b35 d4d711e193c d87daa0ac49 ddf754f77bd dca6bf63030 d61b5cf9bbc dd690bb5fdc" data-node-id="504:3228">
          THE MISSION
        </p>
        <p className="defaa070148 d0f92246acc dda4dbfbc4f d92210b6b0d d8ecebc9f80 d64d9fa1b35 d4d711e193c de39f610589 d69cdf25ad1 dca6bf63030 d1b695498b3 dd690bb5fdc" data-node-id="504:3229">
          мини-приложение
        </p>
      </div>
      <div className="dda4dbfbc4f d70585965a0 d6e718d5684 dfc06b1ec46 dcdbc510d96 d1b4ae5fcbc d36ac6ee9b9" data-node-id="504:3230" data-name="Rectangle" />
      <TheMissionIconArrowLeft className="dda4dbfbc4f d7e96dc113a d341970947d dab89300d37" />
      <div className="dda4dbfbc4f dbb62ced3ea dc78facc7a0 d4571e14696 d92bf82f493 d46ff2abeab dfee8fd5492" data-node-id="504:3233" data-name="Содержание · вертикальная прокрутка">
        <div className="dda4dbfbc4f d507c28c0b9 d60fbb77139 d8dddea0773 d5a55dd2bc1 d60541e1e26 d7e96dc113a d08b04966c7 df9307945e4 d2167406b24 dc25208f291" data-node-id="504:3234" data-name="Контент">
          <p className="d0f92246acc d92210b6b0d d8ecebc9f80 dc2385a463d dd89972fe17 d012fbd121f d5e15045643 de901727572 d0e4b6a9f25 dc25208f291" data-node-id="504:3235">
            Работа готова
          </p>
          <TheMissionDealJourney className="d507c28c0b9 d60fbb77139 d8dddea0773 d166145265e d7ef87877ce d60541e1e26 dd89972fe17 d012fbd121f dc25208f291" />
          <TheMissionDealNextStep className="d0f92246acc d9cedb81f50 d507c28c0b9 d60fbb77139 d8dddea0773 df2c06688bf d60541e1e26 d2f3d084c8b d9bb41f8553 dd89972fe17 da0b31f4d50 d012fbd121f dc25208f291" detail="Проверьте материалы до 12 ноября, 18:00. Если нужны правки, запросите их до этого срока." title="Результат ждёт вашего решения" />
          <div className="d0f92246acc dcbf826a41d d507c28c0b9 d60fbb77139 d8dddea0773 d92210b6b0d d8ecebc9f80 d166145265e d60541e1e26 d615371c70d dd89972fe17 d776b6da583 d8618171d44 d823daa3a6d d08e7bf68b8 d012fbd121f dc25208f291" data-node-id="504:3236" data-name="THE MISSION/Message/Incoming">
            <p className="d973ea86ae9 dd89972fe17 d012fbd121f d69cdf25ad1 de3a33eb148 d5428b00193" data-node-id="I504:3236;502:2617">
              Мария · сегодня
            </p>
            <p className="d64d9fa1b35 dd89972fe17 d012fbd121f d4d2392e8ee de901727572 d5428b00193" data-node-id="I504:3236;502:2618">
              Воронка настроена, регламенты готовы, обучение проведено
            </p>
          </div>
          <div className="d507c28c0b9 d60fbb77139 d90954d61c5 d3960ffc248 d774cf52826 dd89972fe17 d012fbd121f dc25208f291" data-node-id="547:4710" data-name="THE MISSION/Navigation/Item">
            <TheMissionIconNavigationFile06 className="dd89972fe17 d012fbd121f d8b67f4b35a" />
            <div className="d0f92246acc d507c28c0b9 d60fbb77139 d8dddea0773 d65670a533f d60541e1e26 d08b04966c7 dd89972fe17 d012fbd121f dd690bb5fdc" data-node-id="I547:4710;547:4572" data-name="Frame">
              <p className="da05b19b468 de83a7042bc dc3dc13096a dd89972fe17 d012fbd121f dcff55289f8 de901727572 dd690bb5fdc" data-node-id="I547:4710;547:4573">
                Материалы
              </p>
              <p className="d92210b6b0d d8ecebc9f80 de32ac1aeb2 dd89972fe17 d012fbd121f da14daebf77 de3a33eb148 dd690bb5fdc" data-node-id="I547:4710;547:4574">
                Открыть ссылку
              </p>
            </div>
            <TheMissionIconLocalChevronRight20 className="dd89972fe17 d012fbd121f dce3921c70e" />
          </div>
          <a className="dca6bcd4b6f d46906ffb03 dba4c508992 d507c28c0b9 d3451683673 d60fbb77139 da099f94c85 d3960ffc248 d86843cf1e2 d2f3d084c8b dd89972fe17 db9d508be74 d012fbd121f dc25208f291" data-node-id="504:3242" data-name="THE MISSION/Button/Secondary">
            <p className="d0f92246acc da05b19b468 de83a7042bc dc3dc13096a dd89972fe17 d012fbd121f dcff55289f8 de901727572 dca6bf63030 de82ae8be04" data-node-id="I504:3242;502:2637">
              Запросить правки
            </p>
          </a>
          <p className="d0f92246acc d92210b6b0d d8ecebc9f80 d64d9fa1b35 dd89972fe17 d012fbd121f d4d2392e8ee de3a33eb148 dc25208f291" data-node-id="504:3244">
            Если нужны правки, отправьте их до срока. Автозавершение остановится
          </p>
        </div>
      </div>
      <a className="dda4dbfbc4f d507c28c0b9 d3451683673 d60fbb77139 dc05faf844f d3960ffc248 d8ef2268efb d7e96dc113a d08b04966c7 d8e18405018 da8511565c9 dd9bf9e11c7 d121e756d9f dc25208f291" data-node-id="504:3245" style={{ backgroundImage: "linear-gradient(166.1071263494619deg, rgba(240, 250, 245, 0.017) 0%, rgba(240, 250, 245, 0.003) 71.429%), linear-gradient(90deg, rgba(6, 17, 12, 0.58) 0%, rgba(6, 17, 12, 0.58) 100%)" }} data-name="THE MISSION / CTA · Новая кнопка">
        <p className="d0f92246acc da05b19b468 de83a7042bc d76aad9ca0a dd89972fe17 d012fbd121f ddf754f77bd de901727572 d2eba0d65d0 de82ae8be04" data-node-id="I504:3245;478:1831">
          Подтвердить
        </p>
        <div className="dca91f5c8b6 d507c28c0b9 d60fbb77139 d8dddea0773 d3960ffc248 d86843cf1e2 d08b04966c7 dd89972fe17 d4c901ed972 d012fbd121f df4ccd0396a" data-node-id="I504:3245;478:1832" data-name="Стрелка в круге">
          <TheMissionIconLocalArrowRight24 className="dd89972fe17 d012fbd121f d8b67f4b35a" />
        </div>
      </a>
    </div>
  );
}
