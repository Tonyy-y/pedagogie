// Incarca sursele locale in taburile de implementare.
document.querySelectorAll('[data-source]').forEach(async (codeElement) => {
	try {
		const response = await fetch(codeElement.dataset.source);
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		codeElement.textContent = await response.text();
		Prism.highlightElement(codeElement);
	} catch (error) {
		codeElement.textContent = `Sursa nu a putut fi incarcata: ${error.message}`;
	}
});

// Accordion Logic (Descoperire)
const accordions = document.querySelectorAll('.accordion-btn');
accordions.forEach((btn) => {
	btn.addEventListener('click', function () {
		const content = this.nextElementSibling;
		const icon = this.querySelector('span:last-child');

		if (content.classList.contains('open')) {
			content.classList.remove('open');
			icon.textContent = '+';
		} else {
			accordions.forEach((otherBtn) => {
				otherBtn.nextElementSibling.classList.remove('open');
				otherBtn.querySelector('span:last-child').textContent = '+';
			});
			content.classList.add('open');
			icon.textContent = '-';
		}
	});
});

// Tabs Logic (Cod)
const tabBtns = document.querySelectorAll('.code-tab-btn');
const tabContents = document.querySelectorAll('.code-tab-content');

tabBtns.forEach((btn) => {
	btn.addEventListener('click', () => {
		tabBtns.forEach((tabButton) => {
			tabButton.classList.remove('text-indigo-400', 'border-indigo-400', 'bg-slate-900/50');
			tabButton.classList.add('text-slate-400', 'border-transparent');
		});
		btn.classList.add('text-indigo-400', 'border-indigo-400', 'bg-slate-900/50');
		btn.classList.remove('text-slate-400', 'border-transparent');

		tabContents.forEach((content) => content.classList.add('hidden'));
		document.getElementById(btn.dataset.target).classList.remove('hidden');
	});
});

// Sandbox: Kruskal Logic & Visualization
let customEdges = [];
let uniqueNodes = [];
let dsuParent = {};
let algPhase = 'idle';
let currentEdgeIdx = 0;
let mstCost = 0;
let edgesAccepted = 0;

const btnAddEdge = document.getElementById('btnAddEdge');
const edgeListUI = document.getElementById('edgeListUI');
const btnStartKruskal = document.getElementById('btnStartKruskal');
const inputPanel = document.getElementById('inputPanel');
const controlPanel = document.getElementById('controlPanel');
const btnNextStep = document.getElementById('btnNextStep');
const statusText = document.getElementById('statusText');
const svgGraph = document.getElementById('svgGraph');
const inNodeU = document.getElementById('inNodeU');
const inNodeV = document.getElementById('inNodeV');
const inCost = document.getElementById('inCost');
const edgeCount = document.getElementById('edgeCount');

function find(node) {
	if (dsuParent[node] === node) return node;
	dsuParent[node] = find(dsuParent[node]);
	return dsuParent[node];
}

function union(firstNode, secondNode) {
	const rootFirst = find(firstNode);
	const rootSecond = find(secondNode);
	dsuParent[rootFirst] = rootSecond;
}

btnAddEdge.addEventListener('click', () => {
	const u = inNodeU.value.trim().toUpperCase();
	const v = inNodeV.value.trim().toUpperCase();
	const cost = Number.parseInt(inCost.value, 10);

	if (!u || !v || Number.isNaN(cost)) {
		alert('Completati ambele noduri (ex: A, B) si un cost numeric valid.');
		return;
	}
	if (u === v) {
		alert('Nodurile trebuie sa fie diferite (fara self-loops).');
		return;
	}
	if (customEdges.some((edge) => (edge.u === u && edge.v === v) || (edge.u === v && edge.v === u))) {
		alert('Aceasta muchie exista deja in graf.');
		return;
	}

	customEdges.push({ id: customEdges.length, u, v, cost, status: 'default' });
	if (!uniqueNodes.includes(u)) uniqueNodes.push(u);
	if (!uniqueNodes.includes(v)) uniqueNodes.push(v);
	updateListUI();
	drawGraph();
	inNodeU.value = '';
	inNodeV.value = '';
	inCost.value = '';
	inNodeU.focus();
});

function updateListUI() {
	if (customEdges.length === 0) return;
	edgeCount.textContent = customEdges.length;
	if (customEdges.length === 1) edgeListUI.innerHTML = '';

	const lastEdge = customEdges[customEdges.length - 1];
	const listItem = document.createElement('li');
	listItem.className = 'flex justify-between items-center bg-slate-50 px-3 py-2 rounded text-sm text-slate-700 font-mono';
	listItem.innerHTML = `<span>Muchie: <b>${lastEdge.u} - ${lastEdge.v}</b></span> <span class="font-bold">Cost: ${lastEdge.cost}</span>`;
	edgeListUI.appendChild(listItem);
	btnStartKruskal.disabled = !(customEdges.length > 0 && uniqueNodes.length > 1);
}

function drawGraph() {
	svgGraph.innerHTML = '';
	if (uniqueNodes.length === 0) return;

	const width = 600;
	const height = 400;
	const centerX = width / 2;
	const centerY = height / 2;
	const radius = 130;
	const nodePositions = {};

	uniqueNodes.forEach((nodeName, index) => {
		const angle = (2 * Math.PI * index) / uniqueNodes.length - Math.PI / 2;
		nodePositions[nodeName] = {
			x: centerX + radius * Math.cos(angle),
			y: centerY + radius * Math.sin(angle),
		};
	});

	customEdges.forEach((edge) => {
		const firstPosition = nodePositions[edge.u];
		const secondPosition = nodePositions[edge.v];
		let strokeClass = 'edge-default';
		if (edge.status === 'considering') strokeClass = 'edge-considering';
		if (edge.status === 'accepted') strokeClass = 'edge-accepted';
		if (edge.status === 'rejected') strokeClass = 'edge-rejected';

		const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		line.setAttribute('x1', firstPosition.x);
		line.setAttribute('y1', firstPosition.y);
		line.setAttribute('x2', secondPosition.x);
		line.setAttribute('y2', secondPosition.y);
		line.setAttribute('class', `edge ${strokeClass}`);
		svgGraph.appendChild(line);

		const middleX = (firstPosition.x + secondPosition.x) / 2;
		const middleY = (firstPosition.y + secondPosition.y) / 2;
		const labelBackground = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		labelBackground.setAttribute('x', middleX - 12);
		labelBackground.setAttribute('y', middleY - 12);
		labelBackground.setAttribute('width', 24);
		labelBackground.setAttribute('height', 24);
		labelBackground.setAttribute('fill', '#ffffff');
		labelBackground.setAttribute('stroke', '#cbd5e1');
		labelBackground.setAttribute('rx', 12);
		svgGraph.appendChild(labelBackground);

		const weightLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		weightLabel.setAttribute('x', middleX);
		weightLabel.setAttribute('y', middleY + 1);
		weightLabel.setAttribute('text-anchor', 'middle');
		weightLabel.setAttribute('dominant-baseline', 'middle');
		weightLabel.setAttribute('font-size', '13');
		weightLabel.setAttribute('font-weight', 'bold');
		weightLabel.setAttribute('fill', '#334155');
		weightLabel.textContent = edge.cost;
		svgGraph.appendChild(weightLabel);
	});

	Object.entries(nodePositions).forEach(([name, position]) => {
		const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		circle.setAttribute('cx', position.x);
		circle.setAttribute('cy', position.y);
		circle.setAttribute('r', 20);
		circle.setAttribute('class', 'node-circle');
		const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		label.setAttribute('x', position.x);
		label.setAttribute('y', position.y + 1);
		label.setAttribute('class', 'node-text');
		label.textContent = name;
		group.append(circle, label);
		svgGraph.appendChild(group);
	});
}

btnStartKruskal.addEventListener('click', () => {
	if (customEdges.length === 0) return;
	inputPanel.classList.add('opacity-50', 'pointer-events-none');
	btnStartKruskal.classList.add('hidden');
	controlPanel.classList.remove('hidden');
	controlPanel.classList.add('flex');
	dsuParent = {};
	uniqueNodes.forEach((node) => { dsuParent[node] = node; });
	customEdges.sort((firstEdge, secondEdge) => firstEdge.cost - secondEdge.cost);
	edgeListUI.innerHTML = '';
	customEdges.forEach((edge, index) => {
		const listItem = document.createElement('li');
		listItem.id = `ui-edge-${index}`;
		listItem.className = 'flex justify-between items-center bg-slate-50 px-3 py-2 rounded text-sm text-slate-700 font-mono transition-colors';
		listItem.innerHTML = `<span><span class="text-slate-400 mr-2">#${index + 1}</span> ${edge.u} - ${edge.v}</span> <span class="font-bold">Cost: ${edge.cost}</span>`;
		edgeListUI.appendChild(listItem);
	});
	algPhase = 'verify';
	currentEdgeIdx = 0;
	mstCost = 0;
	edgesAccepted = 0;
	statusText.innerHTML = '<span class="text-indigo-600">Am sortat muchiile crescator.</span> Apasa "Pasul Urmator" pentru a incepe verificarea.';
	btnNextStep.textContent = 'Analizeaza Prima Muchie';
});

btnNextStep.addEventListener('click', () => {
	if (algPhase === 'done') return;
	if (currentEdgeIdx >= customEdges.length || edgesAccepted === uniqueNodes.length - 1) {
		finishAlgorithm();
		return;
	}

	const edge = customEdges[currentEdgeIdx];
	const listItem = document.getElementById(`ui-edge-${currentEdgeIdx}`);
	if (algPhase === 'verify') {
		edge.status = 'considering';
		if (listItem) listItem.classList.replace('bg-slate-50', 'bg-yellow-100');
		statusText.innerHTML = `Verificam <b>${edge.u} - ${edge.v}</b> (cost ${edge.cost}). Se formeaza un ciclu?`;
		btnNextStep.textContent = 'Ia Decizia';
		btnNextStep.classList.replace('bg-indigo-600', 'bg-orange-500');
		btnNextStep.classList.replace('hover:bg-indigo-700', 'hover:bg-orange-600');
		algPhase = 'decide';
	} else {
		const formsCycle = find(edge.u) === find(edge.v);
		if (!formsCycle) {
			union(edge.u, edge.v);
			edge.status = 'accepted';
			mstCost += edge.cost;
			edgesAccepted++;
			if (listItem) {
				listItem.classList.replace('bg-yellow-100', 'bg-green-100');
				listItem.classList.add('border', 'border-green-300');
			}
			statusText.innerHTML = `Muchia <b>${edge.u} - ${edge.v}</b> a fost <span class="text-green-600 font-bold">ACCEPTATA</span>. Nu formeaza ciclu.`;
		} else {
			edge.status = 'rejected';
			if (listItem) {
				listItem.classList.replace('bg-yellow-100', 'bg-red-50');
				listItem.classList.add('opacity-60', 'line-through');
			}
			statusText.innerHTML = `Muchia <b>${edge.u} - ${edge.v}</b> a fost <span class="text-red-600 font-bold">RESPINSA</span> (formeaza un ciclu!).`;
		}
		currentEdgeIdx++;
		algPhase = 'verify';
		btnNextStep.textContent = 'Pasul Urmator ➔';
		btnNextStep.classList.replace('bg-orange-500', 'bg-indigo-600');
		btnNextStep.classList.replace('hover:bg-orange-600', 'hover:bg-indigo-700');
		if (edgesAccepted === uniqueNodes.length - 1) btnNextStep.textContent = 'Finalizeaza';
	}
	drawGraph();
});

function finishAlgorithm() {
	algPhase = 'done';
	for (let index = currentEdgeIdx; index < customEdges.length; index++) {
		if (customEdges[index].status === 'default') {
			customEdges[index].status = 'rejected';
			const listItem = document.getElementById(`ui-edge-${index}`);
			if (listItem) listItem.classList.add('opacity-40');
		}
	}
	drawGraph();
	btnNextStep.disabled = true;
	btnNextStep.classList.add('opacity-50', 'cursor-not-allowed');
	statusText.innerHTML = `<b>Algoritm finalizat!</b> Am conectat toate nodurile (${edgesAccepted} muchii).<br>Costul total minim este: <span class="text-xl text-green-600 font-black">${mstCost}</span>`;
	statusText.classList.replace('border-slate-300', 'border-green-400');
	statusText.classList.replace('bg-white', 'bg-green-50');
}

// Navigarea pedagogica intre pasi
const lessonSteps = [...document.querySelectorAll('.lesson-step')];
const previousStepButton = document.getElementById('previousStep');
const nextStepButton = document.getElementById('nextStep');
const stepIndicator = document.getElementById('stepIndicator');
let activeStepIndex = 0;

function updateStepNavigation() {
	const isFirstStep = activeStepIndex === 0;
	const isLastStep = activeStepIndex === lessonSteps.length - 1;
	previousStepButton.classList.toggle('is-hidden', isFirstStep);
	nextStepButton.classList.toggle('is-hidden', isLastStep);
	stepIndicator.textContent = `Pasul ${activeStepIndex + 1} din ${lessonSteps.length}`;
}

function goToStep(stepIndex) {
	const boundedIndex = Math.max(0, Math.min(stepIndex, lessonSteps.length - 1));
	lessonSteps[boundedIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
}

previousStepButton.addEventListener('click', () => goToStep(activeStepIndex - 1));
nextStepButton.addEventListener('click', () => goToStep(activeStepIndex + 1));

const stepObserver = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		if (entry.isIntersecting) {
			activeStepIndex = lessonSteps.indexOf(entry.target);
			updateStepNavigation();
		}
	});
}, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });

lessonSteps.forEach((step) => stepObserver.observe(step));
updateStepNavigation();
